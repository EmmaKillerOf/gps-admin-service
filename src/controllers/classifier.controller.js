const { Op } = require('sequelize');
const { sequelize } = require('../models');
const carrierService = require('../services/carrier.service');
const classifierService = require('../services/classifier.service');



const createClassifier = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { entityId } = req.params;
        const { name } = req.body;

        const classifier = await classifierService.getClassifier({ clasdesc:  name.toLowerCase(), enticlas: entityId });
        if (classifier) throw  'Clasificador ya existe';
        const classifierPayload = {
            clasdesc: name.toLowerCase(),
            enticlas: entityId,
            classtat: true
        }
        const clasifier = await classifierService.createClassifier(classifierPayload);

        await t.commit()

        res.status(200).json({
            ok: true,
            response: clasifier
        }) 
    } catch (error) {
        console.log(error)
        await t.rollback();
        res.status(500).json({
            message: error instanceof ReferenceError ? error.message : error
        }) 
    }
}

const createChildClassifier = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { name, principalParent, directParent } = req.body;

        const classifier = await classifierService.getClassifier({ clasnuid:  principalParent });
        if (!classifier) throw  'Clasificador no existe';
        const childClassifier = await classifierService.getChildClassifier({ clasclva:  principalParent, clvadesc: name.toLowerCase()});
        if (childClassifier) throw  `El clasificador ${classifier.clasdesc} ya tiene un clasificador ${name}`;
        const classifierPayload = {
            clasclva: principalParent,
            clvadesc: name.toLowerCase(),
            clvaunde: directParent || 0,
            clvastat: true
        }
        const classifierCreated = await classifierService.createChildClassifier(classifierPayload);

        await t.commit()

        res.status(200).json({
            ok: true,
            response: classifierCreated
        }) 
    } catch (error) {
        console.log(error)
        await t.rollback();
        res.status(500).json({
            message: error instanceof ReferenceError ? error.message : error
        }) 
    }
}

const getClassifiers = async (req, res) => {
    try {
        const { entityId } = req.params;
        const classifiers = await classifierService.getClassifiers(entityId);

        const classifierTree = classifiers.rows.map(c => {
            const data = JSON.parse(JSON.stringify(c.classvalue));
                return { 
                classtat: c.classtat,    
                clasdesc: c.clasdesc, 
                clasnuid: c.clasnuid,
                enticlas: c.enticlas,
                children: getTree(data) 
            }
        });
        res.status(200).json({
            ok: true,
            response: classifierTree
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
    
}

const updateClassifier = async (req, res) => {
    try {
        const classifierId = Number(req.params.classifierId)
        const { name, status } = req.body;

        const classifier = await classifierService.getClassifier({ clasnuid:  classifierId});
        if (!classifier) throw  'Clasificador no existe';
        const classifierPayload = {
            clasdesc: name.toLowerCase() || classifier.clvadesc,
            classtat: status != undefined ? status : classifier.clvastat
        }
        const clasifier = await classifierService.updateClassifier(classifierId, classifierPayload);


        res.status(200).json({
            ok: true,
            response: clasifier
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
}

const updateChildClassifier = async (req, res) => {
    try {
        const classifierId = Number(req.params.classifierId)
        const { name, status } = req.body;

        const classifier = await classifierService.getChildClassifier({ clvanuid:  classifierId});
        if (!classifier) throw  'Clasificador no existe';
        const classifierPayload = {
            clvadesc: name.toLowerCase() || classifier.clvadesc,
            clvastat: status != undefined ? status : classifier.clvastat
        }
        const clasifier = await classifierService.updateChildClassifier(classifierId, classifierPayload);


        res.status(200).json({
            ok: true,
            response: clasifier
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
}

const getChildClassifiers = async (req, res) => {
    try {
        const { classifierId } = req.params;
        const classifiers = await classifierService.getChildClassifiers({clasclva: classifierId});

        res.status(200).json({
            ok: true,
            response: classifiers
        }) 
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error
        }) 
    }
    
}

const getTree = (data) => {
    const idMapping = data.reduce((acc, el, i) => {
        acc[el.clvanuid] = i;
        return acc;
    }, {});

    let root =[];
    data.forEach(el => {
        // Handle the root element
        if (el.clvaunde === 0) {
            root.push(el);
            return;
        }
        // Use our mapping to locate the parent element in our data array
        const parentEl = data[idMapping[el.clvaunde]];
        // Add our current el to its parent's `children` array
        parentEl.children = [...(parentEl.children || []), el];
    });
    return root
}

module.exports = {
    createClassifier,
    createChildClassifier,
    getClassifiers,
    updateClassifier,
    updateChildClassifier,
    getChildClassifiers
}