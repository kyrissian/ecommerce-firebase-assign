import "whatwg-fetch";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
// @ts-expect-error - Node's TextDecoder type differs slightly from lib.dom's
global.TextDecoder = TextDecoder;
