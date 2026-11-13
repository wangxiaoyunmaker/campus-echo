# JLU main-scene street details

Source: https://jlu.online/ browser-delivered main-world JavaScript, local downloaded app-Dz5ovtb-.js and raster-_AffYBv6.js.

- hydrant.png: `raster.T.hydrant.draw(1, "down", "summer")` (`Wi` renderer), unmodified bitmap with original anchor.
- drain-grate.png: original `YG` pixel sampler, also used by `ZG` along road edges (original interval 480 native pixels).
- round-manhole.png: original `XG` pixel sampler, called by `ZG` in lanes.
- square-manhole.png: original `Eq` 10 × 10 gray cover.
- asphalt-crack-*.png: original `wq` on material 10; only transparent connected components cropped from its output.
- paving-crack-*.png: original `Eq` on material 2; only transparent components cropped from its output.

No asset redesign or AI image generation. Pixel density remains native, suitable at 1/6 host world units per pixel to match the current adapter. Source code and palettes were evaluated in a sandboxed VM with no network access; resulting UInt32 pixel buffers exported losslessly as RGBA PNG.

Runtime placement in Tongji is new host integration and illustrative, not surveyed exact locations. Keep that distinction in user-facing descriptions. Source authorization is recorded by the user; this extraction does not establish a new license. Retain existing project attribution.
