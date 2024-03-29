/* eslint-disable no-console */
import ansiColors from "ansi-colors";
import { Post } from "../../../../shared/types/post";

type Logger = {
  create: ({ entity, iterationNum }: { entity: string; iterationNum?: number }) => void;
  created: ({
    entity,
    iterationNum,
    post,
  }: {
    entity: string;
    iterationNum?: number;
    post?: Post;
  }) => void;
  get: (entity: string) => void;
  retrieve: (entity: string) => void;
  upload: ({ entity, iterationNum }: { entity: string; iterationNum?: number }) => void;
  uploaded: ({ entity, iterationNum }: { entity: string; iterationNum?: number }) => void;
  uploadError: (msg: string) => void;
  error: (msg: string) => void;
};

const addPadding = (str: string) => ` ${str} `;
const capitalize = (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`;
const logPost = (post: Post) => {
  const { id, text, poll, imgs, videoUrl, createdBy } = post;
  const postToLog = {
    id,
    text,
    poll,
    imgs,
    videoUrl,
    createdBy: createdBy?.username,
  };
  logIfEnabled(JSON.stringify(postToLog, null, 2), ansiColors.inverse);
};
const shouldLog = process.env.NODE_ENV !== "test";

const logIfEnabled = (str: string, colorFn = ansiColors.white) => {
  if (shouldLog) console.log(colorFn(str));
};

const botServiceLogger: Logger = {
  create: ({ entity, iterationNum }) => {
    if (!shouldLog) return;

    const entityCap = capitalize(entity);
    const text =
      iterationNum !== undefined
        ? `Creating ${entityCap} number - (${iterationNum + 1})`
        : `Creating ${entityCap}...`;

    const colorFn =
      entity === "posts"
        ? ansiColors.yellowBright.italic
        : entity === "post"
        ? ansiColors.yellow.italic
        : ansiColors.magentaBright.italic;

    logIfEnabled(text, colorFn);
  },
  created: ({ entity, iterationNum, post }) => {
    const entityCap = capitalize(entity);
    const iterationInfo = iterationNum !== undefined ? ` - (${iterationNum + 1})` : "";
    const text = `${entityCap} Created!${iterationInfo}`;
    const paddedText = addPadding(text);

    const colorFn =
      entity === "posts"
        ? ansiColors.bgBlue.italic
        : entity === "post"
        ? ansiColors.bgBlueBright.italic
        : ansiColors.bgMagentaBright.italic;

    logIfEnabled(paddedText, colorFn);

    if (entity === "post" && post) logPost(post);
  },
  get: entity => {
    const entityCap = capitalize(entity);
    const source = entity === "videoUrl" ? "YouTube" : "OpenAI";
    const text = `Getting ${entityCap} from ${source}...`;

    const colorFn =
      entity === "prompt" ? ansiColors.cyanBright.italic : ansiColors.magentaBright.italic;
    logIfEnabled(text, colorFn);
  },
  retrieve: entity => {
    const entityCap = capitalize(entity);
    const text = addPadding(`${entityCap} Recieved!`);
    const colorFn =
      entity === "prompt" ? ansiColors.bgCyan.italic : ansiColors.bgMagentaBright.italic;

    logIfEnabled(text, colorFn);
  },
  upload: ({ entity, iterationNum }) => {
    const entityCap = capitalize(entity);
    const iterationInfo = iterationNum !== undefined ? ` - (${iterationNum + 1})` : "";
    const text = `Uploading ${entityCap}${iterationInfo} to Cloudinary...`;
    const colorFn = ansiColors.redBright.italic;

    logIfEnabled(text, colorFn);
  },
  uploaded: ({ entity, iterationNum }) => {
    const entityCap = capitalize(entity);
    const iterationInfo = iterationNum !== undefined ? ` - (${iterationNum + 1})` : "";
    const text = addPadding(`${entityCap}${iterationInfo} Uploaded!`);
    const colorFn = ansiColors.bgRedBright.italic;

    logIfEnabled(text, colorFn);
  },
  uploadError: msg => {
    const text = addPadding(msg);
    const colorFn = ansiColors.bgBlackBright.black.italic;

    logIfEnabled(text, colorFn);
  },
  error: msg => {
    const currTime = new Date().toLocaleString("he");
    const text = addPadding(`${currTime} - "ERROR" - ${msg}`);
    const colorFn = ansiColors.bgRedBright.italic;

    logIfEnabled(text, colorFn);
  },
};

// command for this file: npx ts-node src\api\bot\services\logger\logger.ts

export { botServiceLogger };
