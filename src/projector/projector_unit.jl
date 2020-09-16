export AbstractParticleProjectorOperator
export ParticleProjectorUnitOperator

abstract type AbstractParticleProjectorOperator <: AbstractParticleOperator end

Base.:(-)(lhs::AbstractParticleProjectorOperator, rhs::AbstractParticleProjectorOperator) = lhs + (-rhs)

struct ParticleProjectorUnitOperator{BR<:Unsigned, S<:Number} <: AbstractParticleProjectorOperator
    bitmask::BR
    bitrow::BR
    bitcol::BR

    parity_bitmask::BR
    amplitude::S

    function ParticleProjectorUnitOperator(bitmask::BR, bitrow::BR, bitcol::BR, parity_bitmask::BR, amplitude::S) where {BR<:Unsigned, S<:Number}
        if bitmask & parity_bitmask != 0
            throw(ArgumentError("bitmask and parity_bitmask should have no overlap"))
        end
        return new{BR, S}(bitmask, bitrow, bitcol, parity_bitmask, amplitude)
    end
end

function Base.zero(::Type{ParticleProjectorUnitOperator{BR, S}}) where {BR, S}
    z = zero(BR)
    return ParticleProjectorUnitOperator(z, z, z, z, zero(S))
end

function Base.one(::Type{ParticleProjectorUnitOperator{BR, S}}) where {BR, S}
    z = zero(BR)
    return ParticleProjectorUnitOperator(z, z, z, z, one(S))
end

Base.iszero(arg::ParticleProjectorUnitOperator) = Base.iszero(arg.amplitude)


function Base.:(*)(lhs::ParticleProjectorUnitOperator{BR, S1}, rhs::ParticleProjectorUnitOperator{BR, S2}) where {BR, S1, S2}
    S = promote_type(S1, S2)
    onlylhs_bitmask   =   lhs.bitmask  & (~rhs.bitmask)
    onlyrhs_bitmask   = (~lhs.bitmask) &  rhs.bitmask
    intersect_bitmask =   lhs.bitmask  &  rhs.bitmask
    union_bitmask     =   lhs.bitmask  |  rhs.bitmask

    if (lhs.bitcol & intersect_bitmask) != (rhs.bitrow & intersect_bitmask)
        return zero(ParticleProjectorUnitOperator{BR, S})
    end

    new_bitmask = union_bitmask
    new_bitrow = lhs.bitrow | (rhs.bitrow & onlyrhs_bitmask)
    new_bitcol = (lhs.bitcol & onlylhs_bitmask) | rhs.bitcol

    new_parity_bitmask = (lhs.parity_bitmask ⊻ rhs.parity_bitmask) & (~union_bitmask)

    isparityeven = mod(count_ones((lhs.bitcol & rhs.parity_bitmask) | (rhs.bitrow & lhs.parity_bitmask)), 2) == 0
    new_amplitude = isparityeven ? lhs.amplitude * rhs.amplitude : -lhs.amplitude * rhs.amplitude

    return ParticleProjectorUnitOperator(new_bitmask, new_bitrow, new_bitcol, new_parity_bitmask, new_amplitude)
end

function Base.:(*)(lhs::Number, rhs::ParticleProjectorUnitOperator)
    return ParticleProjectorUnitOperator(rhs.bitmask, rhs.bitrow, rhs.bitcol, rhs.parity_bitmask, lhs * rhs.amplitude)
end

function Base.:(*)(lhs::ParticleProjectorUnitOperator, rhs::Number)
    return ParticleProjectorUnitOperator(lhs.bitmask, lhs.bitrow, lhs.bitcol, lhs.parity_bitmask, lhs.amplitude * rhs)
end


export make_projector_operator
function make_projector_operator(
    hs::ParticleHilbertSpace{PS, BR, QN},
    op::LadderUnitOperator{PS, PI, OI},
) where {PS, BR, QN, PI<:Integer, OI<:Integer}
    particle = particle_species(PS, op.particle_index)
    bm  = get_bitmask(hs, op.particle_index, op.orbital)
    if isfermion(particle)
        pbm = get_parity_mask(hs, op.particle_index, op.orbital)
        if op.ladder == CREATION
            br = one(BR) << bitoffset(hs, op.particle_index, op.orbital)
            bc = zero(BR)
            return ParticleProjectorUnitOperator(bm, br, bc, pbm, 1.0)
        else
            br = zero(BR)
            bc = one(BR) << bitoffset(hs, op.particle_index, op.orbital)
            return ParticleProjectorUnitOperator(bm, br, bc, pbm, 1.0)
        end
    elseif isboson(particle)
        if maxoccupancy(particle) <= 0
            return NullOperator()
        elseif maxoccupancy(particle) == 1
            pbm = zero(BR)
            if op.ladder == CREATION
                br = one(BR) << bitoffset(hs, op.particle_index, op.orbital)
                bc = zero(BR)
                return ParticleProjectorUnitOperator(bm, br, bc, pbm, 1.0)
            else
                br = zero(BR)
                bc = one(BR) << bitoffset(hs, op.particle_index, op.orbital)
                return ParticleProjectorUnitOperator(bm, br, bc, pbm, 1.0)
            end
        else
            @error "make_projector_operator for bosons and other particles not implemented yet"
        end
    else
        @error "unsupported particle $particle"
    end
end

function make_projector_operator(
    hs::ParticleHilbertSpace{PS, BR, QN},
    op::LadderProductOperator{PS, PI, OI},
) where {PS, BR, QN, PI<:Integer, OI<:Integer}
    return prod(make_projector_operator(hs, f) for f in op.factors)
end

function make_projector_operator(
    hs::ParticleHilbertSpace{PS, BR, QN},
    op::LadderSumOperator{PS, PI, OI, S}
) where {PS, BR, QN, PI<:Integer, OI<:Integer, S}
    return sum(a * make_projector_operator(hs, t) for (t, a) in op.terms)
end