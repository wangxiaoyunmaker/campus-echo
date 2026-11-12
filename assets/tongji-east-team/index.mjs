import './data.js';
import './east-campus-assets.js';
const api=globalThis.TongjiEastCampus;
export const {data,project,unproject,createLayer,drawRoads,mergeRoads,isBuildingPassage,isReferenceEntry,isAssetBlocked}=api;
export const loadImages=(baseOrOptions,options)=>typeof baseOrOptions==='string'||baseOrOptions instanceof URL?api.loadImages(String(baseOrOptions),options):api.loadImages(new URL('./',import.meta.url).href,baseOrOptions);
export default {...api,loadImages};
