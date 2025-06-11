import {
    FactTypeEnum,
    FactZoneSpeEnum,
    FactPartitionTypeEnum,

} from './factEnums.js';

export const DEFAULT_PASTE_PAYLOAD_BASE = {

    customerCubeIdPk: 'KPITEST25',
    factType: FactTypeEnum.FTSTD,
    factProccube: 'FPROCY',
    factZonespe: FactZoneSpeEnum.FZSPEN,
    factPartitiontype: FactPartitionTypeEnum.FPTNUL,


    factComments: 'Pasted via UI (batch)',
    factdbextrIdPk: null,
    factFactdatafiletype: null,
    factFactdatafilename: null,
    factFactdatafilecheckunicity: false,

    // factShortcubename, factShortpresname, factWorkorder are OMITTED.
    // Backend will generate these.
};