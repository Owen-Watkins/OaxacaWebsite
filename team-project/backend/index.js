import express  from "express"
import pg from 'pg'
import cors from 'cors'
const app = express()
app.use(express.json());



const client = new pg.Client({
  connectionString: "postgresql://alelentini2001:v2_3yhPH_Kpa29MPQdzBAi6Ap8r8ug4d@db.bit.io:5432/alelentini2001/oaxaca",
  ssl: true
})

client.connect((err) => {
    if (err) {
      console.error("Error connecting to PostgreSQL", err.stack);
      process.exit(1);
    }
  });
  
app.use(cors())

app.get("/", (req, res) => {
    try {
        res.json("Hello this is backend")
    }catch (err) {
        return res.json(err)
    }
})

app.get("/orders", async (req,res)=>{
    try {
      const q = "SELECT * FROM item;"
      client.query(q, (err,data)=>{
        if(err) throw err
        return res.json(data.rows)
      })
    } catch (err) {
      return res.json(err)
    }
  })

app.get("/pendingOrders", async (req,res)=> {
    try {
        const q = "SELECT * FROM waiter_calls;"
        client.query(q, (err,data)=>{
          if(err) throw err
          return res.json(data.rows)
        })
      } catch (err) {
        return res.json(err)
      }
})
  
  app.get("/orders/diets/:id", async(req,res) => {
    try {
      const id = req.params.id;
      const array = id.split(",").map(item => item.trim());
      const id_length = array.length;
      const q = `SELECT i.*
      FROM item i
      WHERE 
        (SELECT COUNT(*) FROM Item_Diet 
        WHERE item_ID = i.item_ID AND diet_ID IN 
        (${id})) = ${id_length};`
      client.query(q, (err,data)=>{
        if(err) throw err
        return res.json(data.rows)
      })
    } catch (err) {
      return res.json(err)
    }
  })
  
  app.get("/orders/allergens/:id", async(req,res) => {
    try {
      const id = req.params.id;
      const array = id.split(",").map(item => item.trim());
      const id_length = array.length;
      const q = `SELECT i.*
      FROM item i
      WHERE 
        (SELECT COUNT(*) FROM item_allergen 
        WHERE item_ID = i.item_ID AND allergen_id IN 
        (${id})) = ${id_length};`
      client.query(q, (err,data)=>{
        if(err) throw err
        return res.json(data.rows)
      })
    } catch (err) {
      return res.json(err)
    }
  })

  app.get("/orders/itemAndAllergens/:diet/:allergen", async (req, res) => {
    try {
      const diet = req.params.diet;
      const allergen = req.params.allergen;
      const arrayItem = diet.split(",").map(item => item.trim());
      const arrayAllergen = allergen.split(",").map(item => item.trim());
      const diet_length = arrayItem.length;
      const allergen_length = arrayAllergen.length;
      const q = `SELECT i.*
      FROM item i
      WHERE 
        item_ID IN 
        (SELECT item_ID 
         FROM item_allergen 
         WHERE allergen_id IN (${allergen})) 
        AND 
        item_ID IN 
        (SELECT item_ID 
         FROM item_diet 
         WHERE diet_id IN (${diet})) 
         AND 
         (SELECT COUNT(*) FROM item_allergen 
          WHERE item_ID = i.item_ID AND allergen_id IN 
          (${allergen})) = ${allergen_length}
         AND 
         (SELECT COUNT(*) FROM item_diet 
          WHERE item_ID = i.item_ID AND diet_id IN 
          (${diet})) = ${diet_length};`
      client.query(q, (err,data)=>{
        if(err) throw err
        return res.json(data.rows)
      })
    } catch (err) {
      return res.json(err);
    }
  });
  

app.get("/logins", async (req,res)=>{
  try {
    const q = "SELECT * FROM logins;"
    client.query(q, (errors,datas)=>{
      if(errors) throw errors
      return res.json(datas.rows)
    })
  } catch (errors) {
    return res.json(errors)
  }
})

app.put("/orders/unavailable/:id", async(req,res) => {
    try {
      const id = req.params.id;
      const q = `UPDATE Item
        SET is_available = false
        WHERE item_ID = '${id}';`
      client.query(q, (err,data)=>{
        if (err) return res.json(err);
        return res.json("Item has been updated successfully")
      })
    } catch (err) {
      return res.json(err)
    }
  })
  

  app.put("/orders/available/:id", async(req,res) => {
    try {
      const id = req.params.id;
      const q = `UPDATE Item
        SET is_available = true
        WHERE item_ID = '${id}';`
      client.query(q, (err,data)=>{
        if (err) return res.json(err);
        return res.json("Item has been updated successfully")
      })
    } catch (err) {
      return res.json(err)
    }
  })


app.listen(8800, ()=>{
    console.log("Connected to backend!")
})

