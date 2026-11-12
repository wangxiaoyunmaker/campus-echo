import {ut as render} from './vendor/raster-_AffYBv6.js';
// New thin adapter, underlying original Xr unchanged.
export function renderOriginalCar({color=0,facing='down'}={}) {
 if(!['up','down','left','right'].includes(facing))throw Error('four cardinal directions only');
 return render(color,facing);
}
