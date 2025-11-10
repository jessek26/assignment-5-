// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const port = 3000;
const {body, validationResult} = require('express-validator');

//Validation middleware for your POST and PUT endpoints using express-validator
const menuValidation = [
    //Name: Required string, minimum 3 characters
    body('name')
      .isLength({min: 3})
      .withMessage('name must be 3+ characters long'),

    //Description: Required string, minimum 10 characterss
    body('description')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),

    //Price: Required number, greater than 0
    body('price')
        .isFloat({ gt: 0 }) // Checks for a number greater than 0
        .withMessage('Price must be a number greater than 0'),

    //Category: Required string, must be one of: "appetizer", "entree", "dessert", "beverage"
    body('category')
        .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
        .withMessage('Category must be appetizer, entree, dessert, or beverage'),

    //Ingredients: Required array with at least 1 ingredient
    body('ingredients')
        .isArray({ min: 1 })
        .withMessage('Ingredients must be an array with at least one item'),

    //Available: Boolean (defaults to true)
    body('available')
        .optional()
        .isBoolean()
        .withMessage('Available must be a boolean (true or false)')
];
// Data for the server
let menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

//middleware 
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    
    //logs request body for POST and PUT requests
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    
    //for POST and PUT requests, logs the request body
    if (req.method === 'POST' || req.method === 'PUT') {
         console.log('Request Body:', 
             JSON.stringify(req.body, null, 2));
    }
    
    //pass control to the next middleware
    next(); 
};

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages =
    errors.array().map(error => error.msg);
    
        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }

    if (req.body.available === undefined) {
        req.body.available = true;
    }
  
    next();
};

// Define routes and implement middleware here
app.use(express.json());
app.use(requestLogger);


app.get('/', (req,res) => {
  res.json({
    message: 'Welcome to the Restuaraunt API',
    endpoints: {
      "GET/api/menu": "Retrieve all menu items",
      "GET/api/menu/:id": "Retrieve a specific menu item"
    }
  });
});

//GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req,res) => {
  res.json(menuItems);
});

//GET /api/menu/:id - Retrieve a specific menu item
app.get('/api/menu/:id', (req,res) =>{
  const itemId = parseInt(req.params.id);
  const item = menuItems.find(i => i.id === itemId)

  if(item) {
    res.json(item)
  }
  else{
    return res.status(404).json({error: 'Menu item not found'});
  }
});

//POST /api/menu - Add a new menu item
app.post('/api/menu', menuValidation, handleValidationErrors, (req,res) => {
  const {name, description, price, category, ingredients, available} = req.body;

  const newItem = {
    id: menuItems.length + 1,
    name,
    description,
    price,
    category,
    ingredients,
    available
  };
  menuItems.push(newItem);
  return res.status(201).json(newItem);
});

//PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', menuValidation, handleValidationErrors, (req,res) => {
  const itemId = parseInt(req.params.id);
  const {name, description, price, category, ingredients, available} = req.body;

  const itemIndex = menuItems.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({error: 
      'Item not found'
    });
  }

  menuItems[itemIndex] = {
    id: itemId,
    name,
    description,
    price,
    category,
    ingredients,
    available
  }
  res.status(200).json(menuItems[itemIndex]);
});

//DELETE /api/menu/:id - Remove a menu item
app.delete('/api/menu/:id', (req,res) => {
    const itemId = parseInt(req.params.id);

    const itemIndex = menuItems.findIndex(i => i.id === itemId);


    if(itemIndex === -1) {
        return res.status(404).json({error:
            'Item not found'
        });
    };

    const deletedItem = menuItems.splice(itemIndex, 1)[0]; 

    res.status(200).json({message: 'Item successfully deleted', item: deletedItem});
});

//starts server
if(require.main === module) {
    app.listen(port, () => {
        console.log(`Menu API server running at http://localhost:${port}`);
    });
};

module.exports = app;