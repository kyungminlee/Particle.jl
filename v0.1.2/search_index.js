var documenterSearchIndex = {"docs":
[{"location":"api/#API","page":"API","title":"API","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"Modules = [Particle]","category":"page"},{"location":"api/#Particle.ParticleState","page":"API","title":"Particle.ParticleState","text":"ParticleState{PS, BR, QN}\n\n\n\n\n\n","category":"type"},{"location":"api/#Particle.get_fermion_parity-Union{Tuple{PS}, Tuple{ParticleHilbertSpace,ParticleLadderUnit{PS,var\"#s33\",var\"#s32\"} where var\"#s32\"<:Integer where var\"#s33\"<:Integer,Unsigned}} where PS","page":"API","title":"Particle.get_fermion_parity","text":"get_fermion_parity(phs, op, bvec)\n\nGet the fermion parity (0 or 1) for when op is applied to bvec.\n\n\n\n\n\n","category":"method"},{"location":"api/#Particle.locvec2statevec-Union{Tuple{QN}, Tuple{BR}, Tuple{PS}, Tuple{ParticleHilbertSpace{PS,BR,QN},AbstractArray{var\"#s32\",1} where var\"#s32\"<:(AbstractArray{var\"#s31\",1} where var\"#s31\"<:Integer)}} where QN where BR where PS","page":"API","title":"Particle.locvec2statevec","text":"locvec2statevec\n\nparticles : Vector of (Vector of particle location)\n\nExample\n\n  P S 1 2 3 4 5 = |0, e↓, e↑, m, m⟩\n  e↑  0 0 1 0 0\n  e↓  0 1 0 0 0 = c†(m,4) c†(m,5) c†(e↑,3) c†(e↓,2) |Ω⟩\n  m   0 0 0 1 1\n\n\n\n\n\n","category":"method"},{"location":"particle/#Particle-Sector","page":"Particle","title":"Particle Sector","text":"","category":"section"},{"location":"particle/#Particle-Types","page":"Particle","title":"Particle Types","text":"","category":"section"},{"location":"particle/","page":"Particle","title":"Particle","text":"DocTestSetup = quote\n    using Particle\nend","category":"page"},{"location":"particle/","page":"Particle","title":"Particle","text":"julia> f = Fermion(\"f\")\nFermion{:f}()\n\njulia> b = Boson(\"m\", 10)\nBoson{:m,10}()\n\njulia> h = HardcoreBoson(\"h\")\nHardcoreBoson{:h}()\n\njulia> s = Spin(\"s=1/2\", 2)\nSpin{Symbol(\"s=1/2\"),2}()\n\njulia> isboson(f), isfermion(f), isspin(f)\n(false, true, false)\n\njulia> isboson(b), isfermion(b), isspin(b)\n(true, false, false)\n\njulia> isboson(h), isfermion(h), isspin(h)\n(true, false, false)\n\njulia> isboson(s), isfermion(s), isspin(s)\n(false, false, true)\n\njulia> exchangesign(f), exchangesign(b), exchangesign(h), exchangesign(s)\n(-1, 1, 1, 1)\n\njulia> maxoccupancy(f), maxoccupancy(b), maxoccupancy(h), maxoccupancy(s)\n(1, 10, 1, 2)\n\njulia> using ExactDiagonalization\n\njulia> bitwidth(f), bitwidth(b), bitwidth(h), bitwidth(s)\n(1, 4, 1, 2)","category":"page"},{"location":"particle/#Particle-Sector-2","page":"Particle","title":"Particle Sector","text":"","category":"section"},{"location":"particle/","page":"Particle","title":"Particle","text":"julia> electron_up, electron_dn = Fermion(\"e↑\"), Fermion(\"e↓\")\n(Fermion{Symbol(\"e↑\")}(), Fermion{Symbol(\"e↓\")}())\n\njulia> particle_sector = ParticleSector(electron_up, electron_dn)\nParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}}()\n\njulia> numspecies(particle_sector)\n2\n\njulia> speciescount(particle_sector)\n2\n\njulia> getspecies(particle_sector)\n(Fermion{Symbol(\"e↑\")}, Fermion{Symbol(\"e↓\")})\n\njulia> getspecies(particle_sector, 1)\nFermion{Symbol(\"e↑\")}\n\njulia> getspeciesname(particle_sector, 1)\nSymbol(\"e↑\")\n\njulia> exchangesign(particle_sector, 1)\n-1\n\njulia> using ExactDiagonalization\n\njulia> bitwidth(particle_sector)\n2\n\njulia> bitwidth(particle_sector, 2)\n1\n\njulia> bitoffset(particle_sector, 2)\n1\n\njulia> bitoffset(particle_sector)\n3-element Array{Int64,1}:\n 0\n 1\n 2","category":"page"},{"location":"particle/","page":"Particle","title":"Particle","text":"DocTestSetup = quote\n    using Particle\n    using ExactDiagonalization\n    electron_up, electron_dn = Fermion(\"e↑\"), Fermion(\"e↓\")\n    particle_sector = ParticleSector(electron_up, electron_dn)\nend","category":"page"},{"location":"particle/","page":"Particle","title":"Particle","text":"julia> PS = typeof(particle_sector)\nParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}}\n\njulia> get_bitmask(particle_sector, 2)\n0x0000000000000002\n\njulia> get_bitmask(PS, 2)\n0x0000000000000002\n\njulia> compress(particle_sector, [0,1])\n0x0000000000000002\n\njulia> compress(particle_sector, [1,1])\n0x0000000000000003\n\njulia> extract(particle_sector, 0x2)\n2-element Array{Int64,1}:\n 0\n 1","category":"page"},{"location":"particle/","page":"Particle","title":"Particle","text":"DocTestSetup = nothing","category":"page"},{"location":"ladder/#Ladder","page":"Ladder","title":"Ladder","text":"","category":"section"},{"location":"ladder/","page":"Ladder","title":"Ladder","text":"DocTestSetup = quote\n    using Particle\n    electron_up, electron_dn = Fermion(\"e↑\"), Fermion(\"e↓\")\n    particle_sector = ParticleSector(electron_up, electron_dn)\n    cup(i) = ParticleLadderUnit(particle_sector, 1, i, ANNIHILATION)\n    cdn(i) = ParticleLadderUnit(particle_sector, 2, i, ANNIHILATION)\n    cupdag(i) = ParticleLadderUnit(particle_sector, 1, i, CREATION)\n    cdndag(i) = ParticleLadderUnit(particle_sector, 2, i, CREATION)\nend","category":"page"},{"location":"ladder/","page":"Ladder","title":"Ladder","text":"Set up","category":"page"},{"location":"ladder/","page":"Ladder","title":"Ladder","text":"using Particle\nelectron_up, electron_dn = Fermion(\"e↑\"), Fermion(\"e↓\")\nparticle_sector = ParticleSector(electron_up, electron_dn)\ncup(i) = ParticleLadderUnit(particle_sector, 1, i, ANNIHILATION)\ncdn(i) = ParticleLadderUnit(particle_sector, 2, i, ANNIHILATION)\ncupdag(i) = ParticleLadderUnit(particle_sector, 1, i, CREATION)\ncdndag(i) = ParticleLadderUnit(particle_sector, 2, i, CREATION)","category":"page"},{"location":"ladder/#Ladder-Unit","page":"Ladder","title":"Ladder Unit","text":"","category":"section"},{"location":"ladder/","page":"Ladder","title":"Ladder","text":"julia> cup(10)\nParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(1, 10, ANNIHILATION)\n\njulia> cup(10) == cup(10)\ntrue\n\njulia> cup(10) == cdn(10)\nfalse\n\njulia> exchangesign(cup(10), cup(3))\n-1\n\njulia> exchangesign(cup(10), cdn(3))\n1\n\njulia> maxoccupancy(cup(1))\n1\n\njulia> iszero(cup(1))\nfalse\n\njulia> adjoint(cup(10))\nParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(1, 10, CREATION)\n\njulia> using LinearAlgebra\n\njulia> ishermitian(cup(10))\nfalse\n\njulia> prettyprintln(cup(1))\nψ(e↑,1)","category":"page"},{"location":"ladder/#Ladder-Product","page":"Ladder","title":"Ladder Product","text":"","category":"section"},{"location":"ladder/","page":"Ladder","title":"Ladder","text":"DocTestSetup = quote\n    using Particle\n    electron_up, electron_dn = Fermion(\"e↑\"), Fermion(\"e↓\")\n    particle_sector = ParticleSector(electron_up, electron_dn)\n    cup(i) = ParticleLadderUnit(particle_sector, 1, i, ANNIHILATION)\n    cdn(i) = ParticleLadderUnit(particle_sector, 2, i, ANNIHILATION)\n    cupdag(i) = ParticleLadderUnit(particle_sector, 1, i, CREATION)\n    cdndag(i) = ParticleLadderUnit(particle_sector, 2, i, CREATION)\nend","category":"page"},{"location":"ladder/","page":"Ladder","title":"Ladder","text":"julia> cupdag(3) * cup(1)\nParticleLadderProduct{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(ParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}[ParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(1, 3, CREATION), ParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(1, 1, ANNIHILATION)])\n\njulia> adjoint(cupdag(3) * cup(1))\nParticleLadderProduct{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(ParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}[ParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(1, 1, CREATION), ParticleLadderUnit{ParticleSector{Tuple{Fermion{Symbol(\"e↑\")},Fermion{Symbol(\"e↓\")}}},Int64,Int64}(1, 3, ANNIHILATION)])\n\njulia> using LinearAlgebra\n\njulia> ishermitian(cupdag(3) * cup(1))\nfalse\n\njulia> ishermitian(cupdag(1) * cup(1))\ntrue\n\njulia> prettyprintln(cupdag(3)*cdn(1))\nψ†(e↑,3)⋅ψ(e↓,1)","category":"page"},{"location":"#Particle","page":"Home","title":"Particle","text":"","category":"section"},{"location":"#Overview","page":"Home","title":"Overview","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Particle.jl is an extension to ExactDiagonalization.jl.","category":"page"}]
}
