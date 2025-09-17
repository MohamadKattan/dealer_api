const validCreate = {
    name: {
        isString: true,
        notEmpty: true,
        escape: true,
        errorMessage: 'Invalid warehouser name',
    },
    des: {
        isString: true,
        escape: true,
        notEmpty: false,
        errorMessage: 'Invalid warehouser description',

    }
};

const validEdite = {
    id: {
        isNumeric: true,
        notEmpty: true,
        escape: true,
        errorMessage: 'Invalid warehouse id',
    },
    name: {
        isString: true,
        notEmpty: true,
        escape: true,
        errorMessage: 'Invalid warehouser name',
    },
    des: {
        isString: true,
        escape: true,
        notEmpty: false,
        errorMessage: 'Invalid warehouser description',

    }
};

const deleteWhouses = {
    id: {
        isNumeric: true,
        notEmpty: true,
        escape: true,
        errorMessage: 'Invalid warehouse id',
    }
}


const validatorWarehouse = { validCreate, validEdite, deleteWhouses }

export default validatorWarehouse;