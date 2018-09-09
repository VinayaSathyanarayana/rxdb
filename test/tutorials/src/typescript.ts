/**
 * this is the test for the typescript-tutorial
 * IMPORTANT: whenever you change something here,
 * ensure it is also changed in /docs-src/tutorials/typescript.md
 */

// import types
import {
    RxDatabase,
    RxCollection,
    RxJsonSchema,
    RxDocument
} from 'rxdb';

// imports for runtime
import RxDB from 'rxdb';
import * as MemoryAdapter from 'pouchdb-adapter-memory';
RxDB.plugin(MemoryAdapter);

/**
 * declare types
 */

type HeroDocType = {
    passportId: string;
    firstName: string;
    lastName: string;
    age?: number; // optional
};

type HeroDocMethods = {
    scream: (string) => string;
};

type HeroDocument = RxDocument<HeroDocType, HeroDocMethods>;

type HeroCollectionMethods = {
    countAllDocuments: () => Promise<number>;
}

type HeroCollection = RxCollection<HeroDocType, HeroDocMethods>;

type MyDatabaseCollections = {
    heroes: HeroCollection
}

type MyDatabase = RxDatabase<MyDatabaseCollections>;

async function run() {
    /**
     * create database and collections
     */
    const myDatabase: MyDatabase = await RxDB.create<MyDatabaseCollections>({
        name: 'mydb',
        adapter: 'memory'
    });

    const heroSchema: RxJsonSchema = {
        title: 'human schema',
        description: 'describes a human being',
        version: 0,
        disableKeyCompression: false,
        type: 'object',
        properties: {
            passportId: {
                type: 'string',
                primary: true
            },
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            age: {
                type: 'integer'
            }
        },
        required: ['firstName', 'lastName']
    };

    const heroDocMethods: HeroDocMethods = {
        scream: function(this: HeroDocument, what: string) {
            return this.firstName + ' screams: ' + what.toUpperCase();
        }
    };

    const heroCollectionMethods: HeroCollectionMethods = {
        countAllDocuments: async function(this: HeroCollection) {
            const allDocs = await this.find().exec();
            return allDocs.length;
        }
    };

    await myDatabase.collection({
        name: 'heroes',
        schema: heroSchema,
        methods: heroDocMethods,
        statics: heroCollectionMethods
    });



    /**
     * use the database
     */

    // insert a document
    const doc: HeroDocument = await myDatabase.heroes.insert({
        passportId: 'myId',
        firstName: 'piotr',
        lastName: 'potter',
        age: 5
    });

    // access a property
    console.log(doc.firstName);

    // use a orm method
    doc.scream('AAH!');

    // use a static orm method from the collection
    const amount: number = await myDatabase.heroes.countAllDocuments();
    console.log(amount);


    /**
     * clean up
     */
    myDatabase.destroy();
}

run();