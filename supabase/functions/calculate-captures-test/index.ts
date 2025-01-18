// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { captureGroupInTheField } from "../tests/captureGroupInTheField.ts";

Deno.serve(async (req) => {
  const results = [];
  const testData = [{
    procedure: "prepare_single_bottom_right",
    cellId: "jh",
    exeptedCaptured: [
      [
        { x: 9, y: 9, stone: "white" },
      ],
    ],
  },
  {
    procedure: "prepare_group_bottom_left",
    cellId: "cj",
    exeptedCaptured: [
      [
        { x: 1, y: 9, stone: "white" },
        { x: 1, y: 8, stone: "white" },
        { x: 2, y: 9, stone: "white" },
      ],
    ],
  },
  {
    procedure: "prepare_group_bottom_edge",
    cellId: "gj",
    exeptedCaptured: [
      [
        { x: 4, y: 9, stone: "white" },
        { x: 5, y: 9, stone: "white" },
        { x: 6, y: 9, stone: "white" },
      ],
    ],
  },
  {
    procedure: "prepare_group_middle",
    cellId: "ec",
    exeptedCaptured: [
      [
        { x: 5, y: 4, stone: "white" },
        { x: 5, y: 5, stone: "white" },
        { x: 5, y: 6, stone: "white" },
      ],
    ],
  },

  {
    procedure: "prepare_group_top_right",
    cellId: "ga",
    exeptedCaptured: [
      [
        { x: 9, y: 1, stone: "white" },
        { x: 9, y: 2, stone: "white" },
        { x: 8, y: 1, stone: "white" },
      ],
    ],
  },

  {
    procedure: "prepare_group_top_left",
    cellId: "ca",
    exeptedCaptured: [
      [
        { x: 1, y: 1, stone: "white" },
        { x: 1, y: 2, stone: "white" },
        { x: 2, y: 1, stone: "white" },
      ],
    ],
  },
  {
    procedure: "prepare_group_bottom_left",
    cellId: "cj",
    exeptedCaptured: [
      [
        { x: 1, y: 8, stone: "white" },
        { x: 1, y: 9, stone: "white" },
        { x: 2, y: 9, stone: "white" },
      ],
    ],
  },
  {
    procedure: "prepare_group_bottom_right",
    cellId: "jg",
    exeptedCaptured: [
      [
        { x: 8, y: 9, stone: "white" },
        { x: 9, y: 9, stone: "white" },
        { x: 9, y: 8, stone: "white" },
      ],
    ],
  },
  ];

  for (const data of testData) {
    const captureResult = await captureGroupInTheField(
      data.procedure,
      data.cellId,
      data.exeptedCaptured
    );

    const testName = "Test " + data.procedure;
    results.push({ testName: testName, result: captureResult });
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
});
