/**
 * @param {any} bundleId
 * @param {any} meteredUnits
 * @param {any} allocations
 * @returns {any}
 */
export function buildConservationCheck(bundleId, meteredUnits, allocations) {
  const allocatedUnits = (allocations || []).reduce((/** @type {any} */ sum, /** @type {any} */ item) => sum + Number(item.units || 0), 0);
  return {
    bundleId,
    meteredUnits,
    allocatedUnits,
    conserved: allocatedUnits === meteredUnits,
    difference: allocatedUnits - meteredUnits,
    allocations: allocations || []
  };
}
