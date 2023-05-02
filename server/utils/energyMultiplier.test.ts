import energyMultiplier from "./energyMultiplier";
import { EnergyUnit } from "../types";

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
test("gets Mtoe to Mtce quotient", () => {
  expect(energyMultiplier(EnergyUnit.Mtoe, EnergyUnit.Mtce)).toBe(1.42857143);
});

test("365Mtoe to equal 521.428571Mtce", () => {
  expect(round(365 * energyMultiplier(EnergyUnit.Mtoe, EnergyUnit.Mtce), 6)).toBe(521.428572);
});

test("100Mtce to equal 70Mtoe", () => {
  expect(100 * energyMultiplier(EnergyUnit.Mtce, EnergyUnit.Mtoe)).toBe(70);
});
