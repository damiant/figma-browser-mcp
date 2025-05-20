import { FigmaService } from "./services/figma";
import { SimplifiedDesign } from "./services/simplify-node-response";
import yaml from "yaml";

export function getFigmaDataFromURL(url: string) {
  // Extract the file key (XYZ) and node id (123) from the URL
  const urlParts = url.split("/");
  const fileKey = urlParts[urlParts.length - 2]; // Get the second last part of the URL
  const queryParams = url.split("?")[1]; // Get the query parameters
  const nodeId = queryParams
    .split("&")
    .find((param) => param.startsWith("node-id="))
    ?.split("=")[1]; // Extract the node id from the query parameters

  return { fileKey, nodeId };
}

export async function get_figma_data(
  figmaApiKey: string,
  fileKey: string,
  nodeId?: string,
  depth?: number
) {
  try {
    const figmaService = new FigmaService(figmaApiKey);
    console.log(
      `Fetching ${depth ? `${depth} layers deep` : "all layers"} of ${
        nodeId ? `node ${nodeId} from file` : `full file`
      } ${fileKey}`
    );

    let file: SimplifiedDesign;
    if (nodeId) {
      file = await figmaService.getNode(fileKey, nodeId, depth);
    } else {
      file = await figmaService.getFile(fileKey, depth);
    }

    console.log(`Successfully fetched file: ${file.name}`);
    const { nodes, globalVars, ...metadata } = file;

    const result = {
      metadata,
      nodes,
      globalVars,
    };

    console.log("Generating YAML result from file");
    const yamlResult = yaml.stringify(result);

    console.log("Sending result to client");
    return {
      content: [{ type: "text", text: yamlResult }],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`Error fetching file ${fileKey}:`, message);
    return {
      isError: true,
      content: [{ type: "text", text: `Error fetching file: ${message}` }],
    };
  }
}
