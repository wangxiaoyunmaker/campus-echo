# Original JLU circular paving and animated fountain
Internal authorized source reuse, no public redistribution license claimed.

Original-round-plaza.mjs `roundPlazaPixel(nativeX,nativeY,cx,cy,radius)` is unchanged TU. Returns packed RGBA or0 outside circle. Source original plaza-around-fountain radius is fountain bbox maxDimension/2+44native, source _J. TU makes8px radial brick courses, variable segment count and curb/concentric bands. No tilted texture bitmap: sample in shared native coordinates, apply host polygon mask if needed. Original _J only selects medallion in plaza enclosing fountain; not every round shape.

Main-water-grass.mjs `waterPixel(x,y,distance,frontDistance=99,fountain=true)` original PK with fountain mode. distance native distance to water boundary, frontDistance up-screen-to-shore if<=12 otherwise99. waterDistances(mask,w,h) outputs chamfer distance x3 (round /3). Need supply water interior mask and compare up-screen12pixels as existing host integration. Do not call renderTerrain for fountain unchanged, because that helper passes fountain=false. No invented stone basin sprite: original fountain surface is masked material8 PK, then jets.

Original-fountain.mjs:
- renderOriginalJetFrames({h,spread}) unchanged av. Four original styles big64/24,mid28/11,ring20/8,small10/4, each4frames.16transparent PNG and metadata included.
- originalFountainJetLayout({rings}) unchanged BM, integer native anchors. Near-circular minDimension>=320 -> centralbig+24 ring jets at.86 radius;>=96 mid;small under96;elongated shape smalljets every96. Uses polygon containment including holes. Testcircle360diameter yielded25jets.
- OriginalFountainController(kit,ripples): unchanged VM. kit.cap(max26), anim(name)->{frames:frameIDs}, world.vector.areas (surface=fountain,rings), campus(x,y), env.season, ground.get(anim,x,y)->image.setDepth/setFrame, ground.put(image); ripples.spawn(false,x,y,nowMs).
- update(nowMs,dtSeconds,view{left,top,right,bottom}); original85ms/frame+random phase, winter hides, viewport margin64. clear releases sprites. Test20updates on25jets yielded500framechanges.
- Texture frame anchor metadata is water jet base native coordinate, depth=y.

Runtime source uses original cached-noise ground context; helper uses original deterministic continuous noise adapter already shared. Full scene environment/Phaser/pool not included. Module does not move/reshape actual Tongji geography. All ground scales originalnative16px/m; host18px/m needs consistent mapping if real dimensions matter.
