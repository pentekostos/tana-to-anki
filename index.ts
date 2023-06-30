#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

const filename = "export.json";

interface Node {
  id: string;
  props: {
    name?: string;
    _metaNodeId?: string;
  };
  children?: string[];
}

function findOutcome(json: any, tagName: string): void {
  const docs: Node[] = json.docs;

  const tagNode = docs.find(doc => doc.props.name === tagName);
  if (!tagNode) return;

  const tagNodeId = tagNode.id;

  docs.forEach(node => {
    if (node.props._metaNodeId) {
      const metaNode = docs.find(doc => doc.id === node.props._metaNodeId);

      if (metaNode && metaNode.children) {
        metaNode.children.forEach(childId => {
          const childNode = docs.find(doc => doc.id === childId);

          if (childNode && childNode.children && childNode.children.includes(tagNodeId)) {
            console.log(node.props.name);
          }
        });
      }
    }
  });
}

function main(filename: string, tagName: string) {
  try {
    const data = fs.readFileSync(path.resolve(filename), 'utf8');
    const json = JSON.parse(data);
    findOutcome(json, tagName);
  } catch (err: any) {
    console.error(`Error reading or parsing file: ${err.message}`);
  }
}

yargs
  .command(
    'tagged-nodes [tag]', // command name
    'Provide the name of the tag, get nodes that are tagged with the given tag.', // description
    (yargs) => {
      // Define the options for this command
      yargs.positional('tag', {
        describe: 'The tag to search for',
        type: 'string',
      });
    },
    (argv) => {
      if (typeof argv.tag === 'string') {
        main(filename, argv.tag);
      }
    }
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv;
