// node scripts/check-plot-numbers.mjs — sanity check for the plot-number parser.
import assert from "node:assert/strict";
import { parsePlotNumbers, sequencePlotNumbers, splitPlotNumber } from "../lib/plotInventory.js";

assert.deepEqual(parsePlotNumbers("E-1  E-2\tf-35, G - 15\nH12 F-32 F-32"), ["E-1", "E-2", "F-35", "G-15", "H-12", "F-32"]);
assert.deepEqual(parsePlotNumbers("TOTAL INVENTORY : 185  30 UNSOLD 155 SOLD 0 MORTGAGE"), []);
assert.deepEqual(parsePlotNumbers("F-007"), ["F-7"]);
assert.deepEqual(sequencePlotNumbers("f", 1, 3), ["F-1", "F-2", "F-3"]);
assert.deepEqual(sequencePlotNumbers("F", 5, 1), []);
assert.deepEqual(splitPlotNumber("G-56"), { block: "G", seq: 56 });
console.log("plot number checks passed");
