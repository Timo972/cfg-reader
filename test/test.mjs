import Config from '../dist/index.esm.mjs';
import { strict as assert } from 'assert';
import fs from 'fs';

const existingKey = 'test';
const existingValue = 'testval';

const existingDictKey = 'myDict';
const existingDictValue = 'test: 3';

const existingEmptyDictKey = 'mtDict';
const existingEmptyDictValue = '{}';

const existingInlineDictKey = 'inlineDict';
const existingInlineDictValue = '{inline:true}';

const existingEmptyListKey = 'mtList';
const existingEmptyListValue = `[]`;

const existingInlineListKey = 'inlineList';
const existingInlineListValue = `[true, 'hello', 4]`;

const existingListKey = 'myList';
const existingListValue = `[
    true, 
    'hello', 
    4
]`;

const newKey = 'nkey';
const newVal = 'imNew';

const overwriteVal = 'overwrittenVal';

const fileName = 'test.cfg';

before(() => {
    if (fs.existsSync(fileName)) fs.unlinkSync(fileName);

    fs.writeFileSync(
        fileName,
        `${existingEmptyListKey}:${existingEmptyListValue}\n${existingKey}:'${existingValue}'\n${existingDictKey}: {\n${existingDictValue}\n}\n${existingListKey}:${existingListValue}\n${existingInlineListKey}:${existingInlineListValue}\n${existingEmptyDictKey}:${existingEmptyDictValue}\n${existingInlineDictKey}:${existingInlineDictValue}`,
        {
            encoding: 'utf8',
        },
    );
});

after(() => {
    if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
});

describe('Existing config', () => {
    describe('Lists', () => {
        let config;

        it('Open file', () => {
            config = new Config(fileName);
        });

        it('Get existing list', () => {
            const val = config.get(existingListKey);
            assert.deepStrictEqual(
                val,
                [true, 'hello', 4],
                `Failed to parse list:\nexpected: ${JSON.stringify([true, 'hello', 4])}\ngot: ${JSON.stringify(
                    val,
                )}\ngot type: ${typeof val}`,
            );
        });

        it('Get empty list', () => {
            const val = config.get(existingEmptyListKey);
            assert.deepStrictEqual(
                val,
                [],
                `Failed to parse list:\nexpected: ${JSON.stringify([])}\ngot: ${JSON.stringify(
                    val,
                )}\ngot type: ${typeof val}`,
            );
        });

        it('Get inline list', () => {
            const val = config.get(existingInlineListKey);
            assert.deepStrictEqual(
                val,
                [true, 'hello', 4],
                `Failed to parse list:\nexpected: ${JSON.stringify([true, 'hello', 4])}\ngot: ${JSON.stringify(
                    val,
                )}\ngot type: ${typeof val}`,
            );
        });

        it('Set list', () => {
            const success = config.set(existingListKey, [true, 'hello', 5]);
            assert.strictEqual(success, true, 'Error while setting list');
        });

        it('Save list', () => {
            const success = config.save();
            assert.strictEqual(success, true, 'Could not save changes to file');
        });

        it('Re-open file', () => {
            config = new Config(fileName);
        });

        it('Check serialization', () => {
            const updatedValue = config.get(existingListKey);
            assert.deepStrictEqual(updatedValue, [true, 'hello', 5], 'Changes not applied');
        });
    });

    describe('Dicts', () => {
        let config;

        it('Open file', () => {
            config = new Config(fileName);
        });

        it('Get existing dict', () => {
            //console.log(fs.readFileSync(fileName, 'utf8'));
            const val = config.get(existingDictKey);
            assert.deepStrictEqual(
                val,
                { test: 3 },
                `Failed to parse dict:\nexpected: ${JSON.stringify({ test: true })}\ngot: ${JSON.stringify(val)}`,
            );
        });

        it('Get empty dict', () => {
            //console.log(fs.readFileSync(fileName, 'utf8'));
            const val = config.get(existingEmptyDictKey);
            assert.deepStrictEqual(
                val,
                {},
                `Failed to parse dict:\nexpected: ${JSON.stringify({})}\ngot: ${JSON.stringify(val)}`,
            );
        });

        it('Get inline dict', () => {
            //console.log(fs.readFileSync(fileName, 'utf8'));
            const val = config.get(existingInlineDictKey);
            assert.deepStrictEqual(
                val,
                { inline: true },
                `Failed to parse dict:\nexpected: ${JSON.stringify({ test: true })}\ngot: ${JSON.stringify(val)}`,
            );
        });

        it('Set list', () => {
            const success = config.set(existingDictKey, { overwritten: true });
            assert.strictEqual(success, true, 'Error while setting list');
        });

        it('Save dict', () => {
            const success = config.save();
            assert.strictEqual(success, true, 'Could not save changes to file');
        });

        it('Re-open file', () => {
            config = new Config(fileName);
        });

        it('Check serialization', () => {
            const updatedValue = config.get(existingDictKey);
            assert.deepStrictEqual(updatedValue, { overwritten: true }, 'Changes not applied');
        });
    });

    describe('Integers, Booleans, Strings', () => {
        let config;

        it('Open file', () => {
            config = new Config(fileName);
        });

        it('Get existing value', () => {
            const val = config.get(existingKey);
            assert.strictEqual(
                val,
                existingValue,
                `Wrong value returned:\nexpected type: ${typeof existingValue}\ngot type: ${typeof val}\nexpected value: ${existingValue}\ngot value: ${val}`,
            );
        });

        it('Set new value', () => {
            const success = config.set(newKey, newVal);
            assert.strictEqual(success, true, 'Error while setting key/value');
        });

        it('Check new value', () => {
            const val = config.get(newKey);
            assert.strictEqual(val, newVal, 'Failed to set new value');
        });

        it('Overwrite existing value', () => {
            const success = config.set(existingKey, overwriteVal);
            assert.strictEqual(success, true, 'Error while overwriting an existing key/value');
        });

        it('Check overwritten value', () => {
            const val = config.get(existingKey);
            assert.strictEqual(val, overwriteVal, 'Failed to overwrite value');
        });

        it('Save changes to file', () => {
            const success = config.save();
            assert.strictEqual(success, true, 'Could not save changes to file');
        });

        it('Check serialization', () => {
            const updatedConfig = new Config(fileName);
            const updatedValue = updatedConfig.get(existingKey);
            assert.strictEqual(updatedValue, overwriteVal, 'Changes not applied');
        });
    });
});
