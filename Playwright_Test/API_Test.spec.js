/**
 * @file Swagger Pet Store API Test
 * @description Automated API tests for the Swagger Pet Store API using Playwright.
 *              Includes CRUD operations, and edge case validations.
 *
 * @author Yazan
 * @created 2025-07-15
 * @tool VSC + Postman + Newman CLI Reporter
 */

const { test, expect } = require('@playwright/test')

test.describe("Pet APIs Testing", () => {
    function validatePet(pet) {
        expect(pet).toHaveProperty("id")
        expect(pet).toHaveProperty("photoUrls")
        expect(pet).toHaveProperty("status")
        expect(pet).toHaveProperty("tags")
        expect(pet).toHaveProperty("category")

        expect(pet.category).toHaveProperty("id")
        expect(pet.category).toHaveProperty("name")

        expect(typeof pet.id).toBe("number")
        expect(typeof pet.status).toBe("string")
        expect(typeof pet.category).toBe("object")
        expect(typeof pet.category.id).toBe("number")
        expect(typeof pet.category.name).toBe("string")
        expect(Array.isArray(pet.photoUrls)).toBe(true)
        expect(Array.isArray(pet.tags)).toBe(true)

        expect(["pending", "available", "sold"]).toContain(pet.status)
    }

    test.skip("/pet/findByStatus Find Pets By Status - Positive", async ({ request }) => {

        const start = Date.now()
        const Response = await request.get("https://petstore.swagger.io/v2/pet/findByStatus",
            { params: { status: "available" } })
        const duration = Date.now() - start

        console.log(`Response time: ${duration}ms`)
        expect(duration).toBeLessThan(1000)

        const Response_JSON = await Response.json()
        console.log(Response_JSON)

        expect(Response.status()).toBe(200)
        expect(Array.isArray(Response_JSON)).toBe(true)
        expect(Response_JSON.length).toBeGreaterThan(0)

        for (let i = 0; i < Math.min(Response_JSON.length, 3); i++) {
            validatePet(Response_JSON[i])
            expect(pet).toHaveProperty("name")
            expect(typeof pet.name).toBe("string")
        }
    })

    //BUG
    test.fixme("/pet/findByStatus Find Pets By Status - Negative 1: Empty Status", async ({ request }) => {

        const start = Date.now()
        const Response = await request.get("https://petstore.swagger.io/v2/pet/findByStatus",
            { params: { status: "" } })
        const duration = Date.now() - start

        console.log(await Response.json())
        expect(duration).toBeLessThan(1000)
        expect(Response.status()).toBe(400)
        expect((await Response.json()).length).toBe(0)
    })

    test("/pet/findByStatus Find Pets By Status - Negative 2: Wrong Status", async ({ request }) => {

        const start = Date.now()
        const Response = await request.get("https://petstore.swagger.io/v2/pet/findByStatus",
            { params: { status: "A7A" } })
        const duration = Date.now() - start

        console.log(await Response.json())
        expect(duration).toBeLessThan(1000)
        expect.soft(Response.status()).toBe(400)
        expect((await Response.json()).length).toBe(0)
    })

    test("/pet/findByStatus Find Pets By Status - Negative 3: No Status", async ({ request }) => {

        const start = Date.now()
        const Response = await request.get("https://petstore.swagger.io/v2/pet/findByStatus")
        const duration = Date.now() - start

        console.log(await Response.json())
        expect(duration).toBeLessThan(1000)
        expect.soft(Response.status()).toBe(400)
        expect((await Response.json()).length).toBe(0)
    })

    test("/pet/{ID} Find Pet By ID - Positive", async ({ request }) => {

        const start = Date.now()
        const Response = await request.get("https://petstore.swagger.io/v2/pet/12345")
        const duration = Date.now() - start

        const Response_JSON = await Response.json()
        console.log(Response_JSON)

        expect(Response.status()).toBe(200)
        expect(duration).toBeLessThan(1000)
        expect(typeof (Response_JSON)).toBe("object")
        expect(Response_JSON.id).toBe(12345)
        validatePet(Response_JSON) 
    })

    test("/pet/{ID} Find Pet By ID - Negative 1: No ID", async ({ request }) => {

        const start = Date.now()
        const Response = await request.get("https://petstore.swagger.io/v2/pet/")
        const duration = Date.now() - start

        console.log(await Response.text())

        expect(Response.status()).toBe(405)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet/{ID} Find Pet By ID - Negative 2: Invalid ID", async ({ request }) => {

        const start = Date.now()
        const Response = await request.get("https://petstore.swagger.io/v2/pet/888")
        const duration = Date.now() - start

        const Response_JSON = await Response.json()
        console.log(Response_JSON)

        expect(Response.status()).toBe(404)
        expect(duration).toBeLessThan(1000)
        expect(typeof(Response_JSON)).toBe('object')

        expect(Response_JSON).toHaveProperty('code')
        expect(Response_JSON).toHaveProperty('type')
        expect(Response_JSON).toHaveProperty('message')

        expect(typeof(Response_JSON.code)).toBe('number')
        expect(typeof(Response_JSON.type)).toBe('string')
        expect(typeof(Response_JSON.message)).toBe('string')

        expect(Response_JSON.message).toBe('Pet not found')
    })

    test("/pet Add a New Pet to the Store - Positive", async ({request}) => {

        const payload = {
            id: 889,
            category: { id: 1, name: "A7A"},
            name: "LaBWa",
            photoUrls: ["string"],
            tags: [{id: 0, name: "string"}],
            status: "available"
        }

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet", 
            {data: payload,
             headers: {"Content-Type": "application/json"}
            })

        const duration = Date.now() - start

        const Response_JSON = await Response.json()
        console.log(Response_JSON)
        expect(Response.status()).toBe(200)
        expect(duration).toBeLessThan(1000)
        validatePet(Response_JSON)
    })

    test("/pet Add a New Pet to the Store - Negative: Unsupported Content-Type", async ({request}) => {

        const payload = {
            id: 889,
            category: { id: 1, name: "A7A"},
            name: "LaBWa",
            photoUrls: ["string"],
            tags: [{id: 0, name: "string"}],
            status: "available"
        }

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet", 
            {data: payload,
             headers: {"Content-Type": "application/x-www-form-urlencoded"}
            })

        const duration = Date.now() - start

        expect(Response.status()).toBe(415)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet Add a New Pet to the Store - Negative: Post without Content", async ({request}) => {

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet", 
            {headers: {"Content-Type": "application/x-www-form-urlencoded"}})

        const duration = Date.now() - start

        expect(Response.status()).toBe(415)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet Add a New Pet to the Store - Negative: Wrong Content", async ({request}) => {

        const payload = {
            id: "yasyd",
            category: { id: 1, name: "A7A"},
            name: "LaBWa",
            photoUrls: ["string"],
            tags: [{id: 0, name: "string"}],
            status: "available"
        }

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet", 
            {data: payload,
             headers: {"Content-Type": "application/x-www-form-urlencoded"}
            })

        const duration = Date.now() - start

        expect(Response.status()).toBe(415)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet Add a New Pet to the Store - Negative: Wrong DataTypes", async ({request}) => {

        const payload = {
            idd: "889",
            ccategory: { id: 1, name: "A7A"},
            nname: "LaBWa",
            pphotoUrls: ["string"],
            ttags: [{id: 0, name: "string"}],
            sstatus: "available"
        }

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet", 
            {data: payload,
             headers: {"Content-Type": "application/x-www-form-urlencoded"}
            })

        const duration = Date.now() - start

        expect(Response.status()).toBe(415)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet/{petId}/uploadImage Upload Image to Pet - Positive", async ({request}) => {

        const payload = {additionalMetadata: "NewPhoto",    file: "@Blink.ino.standard.hex"}

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet/1004/uploadImage", 
            {multipart : payload})

        const duration = Date.now() - start

        const Response_JSON = await Response.json()
        console.log(Response_JSON)
        expect(Response.status()).toBe(200)
        expect(duration).toBeLessThan(1000)

        expect(typeof(Response_JSON)).toBe('object')
        expect(Response_JSON).toHaveProperty('code')
        expect(Response_JSON).toHaveProperty('type')
        expect(Response_JSON).toHaveProperty('message')
        expect(typeof(Response_JSON.code)).toBe('number')
        expect(typeof(Response_JSON.type)).toBe('string')
        expect(typeof(Response_JSON.message)).toBe('string')
    })

    //BUG
    test.fixme("/pet/{petId}/uploadImage Upload Image to Pet - Nagative: Unexisting ID", async ({request}) => {

        const payload = {additionalMetadata: "NewPhoto",    file: "@Blink.ino.standard.hex"}

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet/1003/uploadImage", 
            {multipart : payload})

        const duration = Date.now() - start

        const Response_JSON = await Response.json()
        console.log(Response_JSON)
        expect(Response.status()).toBe(404)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet/{petId}/uploadImage Upload Image to Pet - Nagative: NO Updates", async ({request}) => {

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet/1003/uploadImage") 
            //{multipart : payload})

        const duration = Date.now() - start

        const Response_JSON = await Response.json()
        console.log(Response_JSON)
        expect(Response.status()).toBe(415)
        expect(duration).toBeLessThan(1000)
    })

    //BUG
    test.fixme("/pet/{petId}/uploadImage Upload Image to Pet - Negative: Wrong Data", async ({request}) => {

        const payload = {additionalMetadata: 99,    file: 999}

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet/1004/uploadImage", 
            {multipart : payload})

        const duration = Date.now() - start

        const Response_JSON = await Response.json()
        console.log(Response_JSON)
        expect(Response.status()).toBe(415)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet/{petId}/uploadImage Upload Image to Pet - Negative: Wrong Data Type", async ({request}) => {

        const payload = {xy: "NewPhoto",    yx: "@Blink.ino.standard.hex"}

        const start = Date.now()
        const Response = await request.post("https://petstore.swagger.io/v2/pet/1004/uploadImage", 
            {multipart : payload})

        const duration = Date.now() - start

        expect(Response.status()).toBe(500)
        expect(duration).toBeLessThan(1000)
    })

    test("/pet Update existing pet - Positive", async ({request}) => {
        const payload = {
            id: 889,
            category: { id: 1, name: "A7A"},
            name: "LaBWa",
            photoUrls: ["string"],
            tags: [{id: 0, name: "string"}],
            status: "available"
        }

        const Response = await request.put("https://petstore.swagger.io/v2/pet",
            {data: payload,
             headers: {"Content-Type": "application/json"}
            })

        const Response_JSON = await Response.json()
        console.log(Response_JSON)

        expect(Response.status()).toBe(200)
        expect(typeof Response_JSON).toBe("object")
        validatePet(Response_JSON)
        expect(Response_JSON.id).toBe(889)
        expect(Response_JSON.name).toBe("LaBWa")
        expect(Response_JSON).toHaveProperty("name")
    })

    test.fixme("/pet Update existing pet - Negative: Invalid ID", async ({request}) => {
        const payload = {
            id: 8899939499799999, //Mo4 Mawgoooooooooooooooood
            category: { id: 1, name: "A7A"},
            name: "LaBWa",
            photoUrls: ["string"],
            tags: [{id: 0, name: "string"}],
            status: "available"
        }

        const Response = await request.put("https://petstore.swagger.io/v2/pet",
            {data: payload,
             headers: {"Content-Type": "application/json"}
            })

        const Response_JSON = await Response.json()
        console.log(Response_JSON)

        expect(Response.status()).toBe(400)
        expect(typeof Response_JSON).toBe("object")
    })

    test.fixme("/pet Update existing pet - Negative: Wrong ID Format", async ({request}) => {
        const payload = {
            id: "8899939499799999", //Mo4 Mawgoooooooooooooooood
            category: { id: 1, name: "A7A"},
            name: "LaBWa",
            photoUrls: ["string"],
            tags: [{id: 0, name: "string"}],
            status: "available"
        }

        const Response = await request.put("https://petstore.swagger.io/v2/pet",
            {data: payload,
             headers: {"Content-Type": "application/json"}
            })

        const Response_JSON = await Response.json()
        console.log(Response_JSON)

        expect(Response.status()).toBe(400)
        expect(typeof Response_JSON).toBe("object")
    })

    test.only("/pet Update existing pet - Negative: Wrong ID Format", async ({request}) => {
        const payload = {
            id: "8899939499799999", //Mo4 Mawgoooooooooooooooood
            category: { id: 1, name: "A7A"},
            name: "LaBWa",
            photoUrls: ["string"],
            tags: [{id: 0, name: "string"}],
            status: "available"
        }

        const Response = await request.put("https://petstore.swagger.io/v2/pet",
            {data: payload,
             headers: {"Content-Type": "application/json"}
            })

        const Response_JSON = await Response.json()
        console.log(Response_JSON)

        expect(Response.status()).toBe(400)
        expect(typeof Response_JSON).toBe("object")
    })
})
