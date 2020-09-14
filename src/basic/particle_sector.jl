export ParticleSector, ParticleIndex

import ExactDiagonalization.bitwidth
import ExactDiagonalization.compress
import ExactDiagonalization.extract
import ExactDiagonalization.get_bitmask

export num_particle_species, particle_species, particle_species_name

export make_particle_sector
export bitoffset


struct ParticleSector{P<:Tuple{Vararg{AbstractParticle}}}
    function ParticleSector{P}() where {P<:Tuple{Vararg{AbstractParticle}}}
        return new{P}()
    end

    function ParticleSector(::Type{P}) where {P<:Tuple{Vararg{AbstractParticle}}}
        return new{P}()
    end
end


function make_particle_sector(p::AbstractParticle...)
    P = typeof(p)
    return ParticleSector(P)
end


num_particle_species(::Type{ParticleSector{P}}) where {P} = tuplelength(P)
particle_species(::Type{P}) where {P<:ParticleSector} = P.parameters[1].parameters

particle_species(::Type{ParticleSector{P}}, index::Integer) where {P} = P.parameters[index]::DataType
particle_species_name(::Type{ParticleSector{P}}, index::Integer) where {P} = particle_species(ParticleSpecies{P}, index).parameter[1]::Symbol


# occupation representaiton

bitwidth(::Type{P}) where {P<:ParticleSector} = sum(bitwidth(p) for p in particle_species(P))
bitwidth(::Type{P}, iptl::Integer) where {P<:ParticleSector} = bitwidth(particle_species(P, iptl))


function bitoffset(::Type{P}, iptl::Integer)::Int where {P<:ParticleSector}
    species = particle_species(P)
    offset = 0
    for i in 1:(iptl-1)
        offset += bitwidth(species[i])
    end
    return offset
end


function get_bitmask(
    ::Type{P},
    iptl::Integer,
    binary_type::Type{BR}=UInt,
)::BR where {P<:ParticleSector, BR<:Unsigned}
  offset = bitoffset(P, iptl)
  return make_bitmask(offset+bitwidth(P, iptl), offset, BR)
end


function compress(
    ::Type{P},
    occupancy::AbstractVector{<:Integer},
    binary_type::Type{BR}=UInt,
)::BR where {P<:ParticleSector, BR<:Unsigned}
    if length(occupancy) != num_particle_species(P)
        throw(ArgumentError("length of occupancy vector should match the number of particles"))
    elseif sizeof(BR) * 8 < bitwidth(P)
        throw(ArgumentError("type $BR is too short to represent the particle sector"))
    end

    out = zero(BR)
    offset = 0
    for (i, (p, n)) in enumerate(zip(particle_species(P), occupancy))
        n < 0 && throw(ArgumentError("occupancy should be non-negative"))
        n > maxoccupancy(p) && throw(ArgumentError("occupancy ($n) should be no greater than the maxoccupancy of particle ($p)"))
        out |= BR(n) << offset
        offset += bitwidth(p)
    end
    return out
end


function extract(::Type{P}, occbin::BR)::Vector{Int} where {P<:ParticleSector, BR<:Unsigned}
    offset = 0
    n_particles = num_particle_species(P)
    occ = Vector{Int}(undef, n_particles)
    for (i, p) in enumerate(particle_species(P))
        mask = (one(BR) << bitwidth(p)) - 1
        n = Int(occbin & mask)
        @boundscheck if n > maxoccupancy(p)
            throw(ArgumentError("Occupation $n of $p exceeds $(maxoccupancy(p))"))
        end
        occ[i] = n
        occbin >>= bitwidth(p)
    end
    @assert(iszero(occbin))
    return occ
end


for fname in [
    :bitwidth, :bitoffset, :get_bitmask,
    :compress, :extract,
    :num_particle_species, :particle_species, :particle_species_name,
]
    @eval begin
        ($fname)(p::P, args...) where {P<:ParticleSector} = ($fname)(P, args...)
    end
end


# Mainly for the ladder operators
struct ParticleIndex{P<:ParticleSector}
    index::Int

    function ParticleIndex(::Type{P}, index::Integer) where {P<:ParticleSector}
        NP = num_particle_species(P)
        (0 < index <= NP) || throw(ArgumentError("index should be 0 < index <= NP"))
        new{P}(index)
    end

    ParticleIndex(::P, args...) where {P<:ParticleSector} = ParticleIndex(P, args...)
end


Base.convert(::Type{T}, pi::ParticleIndex) where {T<:Integer} = convert(T, pi.index)


Base.isless(lhs::ParticleIndex{P}, rhs::ParticleIndex{P}) where P = Base.isless(lhs.index, rhs.index)
Base.:(==)(lhs::ParticleIndex{P}, rhs::ParticleIndex{P}) where P = lhs.index == rhs.index


particle_species(p::ParticleIndex{P}) where {P<:ParticleSector} = P.parameters[1].parameters[p.index]
particle_species_name(p::ParticleIndex{P}) where {P<:ParticleSector} = particle_species(p).parameters[1]
bitwidth(p::ParticleIndex{P}) where {P<:ParticleSector} = bitwidth(P, p.index)
bitoffset(p::ParticleIndex{P}) where {P<:ParticleSector} = bitoffset(P, p.index)
get_bitmask(p::ParticleIndex{P}) where {P<:ParticleSector} = get_bitmask(P, p.index)
