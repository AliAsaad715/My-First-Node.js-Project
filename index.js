const express = require("express");

const mongoose = require("mongoose");

const app = express();

const Article = require("./models/Article");

mongoose.connect("mongodb+srv://ali715asaad:a2004l7i15@cluster0.4febrgn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("connected successfully");
    }).catch((error) => {
        console.log("error with connecting with the DB", error);
    });

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello in node.js project');
})

app.get('/hello', (req, res) => {
    res.send('Hello World!');
})

app.post('/hi', (req, res) => {
    res.send('hi');
})

app.get('/numbers', (req, res) => {
    // let array = [];
    // for (let i = 1; i <= 100; i++) {
    //     array.push(i);
    // }
    // res.send(`${array}`);


    let numbers = "";
    for (let i = 1; i <= 100; i++) {
        numbers += i + " - ";
    }
    // res.send(numbers);

    // res.sendFile(__dirname + '/views/numbers.ejs')
    res.render("numbers.ejs", {
        name: "Ali",
        numbers: numbers
    });
});


app.get('/findSummation/:num1/:num2', (req, res) => {
    // console.log(req.params);

    const num1 = req.params.num1;
    const num2 = req.params.num2;
    const total = Number(num1) + Number(num2);
    res.send(`The total is: ${total}`);
});


app.get('/sayHello', (req, res) => {
    // console.log(req.body);

    // console.log(req.query)

    // res.send(`Hello ${req.body.name}, Age is ${req.query.age}`);

    res.json({
        name: req.body.name,
        age: req.query.age,
        message: "User retrieved succesfully"
    });
});

// ===== ARTICLES ENDPOINTS =====
app.post('/articles/create', async (req, res) => {
    const article = new Article();

    const title = req.body.articleTitle;;
    const body = req.body.articleBody;

    article.title = title;
    article.body = body;
    article.numberOfLikes = 0;

    await article.save();

    res.json(article);
});

app.get('/articles/get', async (req, res) => {
    const articles = await Article.find();

    res.json(articles);
});

app.get('/articles/get/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        res.json(article);
    } catch (error) {
        console.log("error", error);
    }
});

app.delete('/articles/delete/:id', async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.send("The article deleted successfully");
    } catch (error) {
        console.log("error", error);
    }
});

app.get('/getArticles', async (req, res) => {
    const articles = await Article.find();

    res.render("articles.ejs", {
        allArticles: articles
    });
});


app.listen(3000, () => {
    console.log("I am listening in port 3000")
});