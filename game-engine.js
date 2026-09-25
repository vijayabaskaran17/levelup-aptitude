// Enhanced Game Engine with Timers and Advanced Features
class GameEngine {
    constructor() {
        this.currentGame = null;
        this.currentQuestionIndex = 0;
        this.gameScore = 0;
        this.gameQuestions = [];
        this.timer = null;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.gameStartTime = null;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.skippedAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.soundEnabled = true;
        this.animationsEnabled = true;
        
        this.initializeSounds();
        this.setupEventListeners();
    }

    initializeSounds() {
        // Create audio context for sound effects
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.soundEnabled = false;
        }
    }

    setupEventListeners() {
        // Game control events
        document.addEventListener('keydown', (e) => {
            if (this.currentGame && document.getElementById('game-modal').style.display === 'block') {
                this.handleKeyboardInput(e);
            }
        });
    }

    handleKeyboardInput(e) {
        const key = e.key;
        if (key >= '1' && key <= '4') {
            const optionIndex = parseInt(key) - 1;
            this.selectOption(optionIndex);
        } else if (key === 'Enter') {
            this.submitAnswer();
        } else if (key === 'Escape') {
            this.closeGame();
        }
    }

    startGame(category) {
        if (!this.checkAuthentication()) return;

        this.currentGame = category;
        this.resetGameStats();
        this.loadGameData(category);
        this.showGameModal();
        this.loadQuestion();
        this.startTimer();
        this.playSound('gameStart');
    }

    checkAuthentication() {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            this.showNotification('Please login to play games', 'error');
            this.showLoginModal();
            return false;
        }
        return true;
    }

    resetGameStats() {
        this.currentQuestionIndex = 0;
        this.gameScore = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.skippedAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.gameStartTime = Date.now();
    }

    loadGameData(category) {
        const gameConfig = this.getGameConfig(category);
        this.gameQuestions = [...gameConfig.questions];
        this.totalTime = gameConfig.timePerQuestion;
        this.shuffleQuestions();
    }

    getGameConfig(category) {
        const configs = {
            mathematical: {
                timePerQuestion: 30,
                questions: [
                    {
                        question: "What is 15% of 240?",
                        options: ["36", "32", "40", "28"],
                        correct: 0,
                        explanation: "15% of 240 = 0.15 × 240 = 36",
                        difficulty: "medium"
                    },
                    {
                        question: "If a train travels 300 km in 4 hours, what is its average speed?",
                        options: ["75 km/h", "80 km/h", "70 km/h", "85 km/h"],
                        correct: 0,
                        explanation: "Average speed = Distance ÷ Time = 300 ÷ 4 = 75 km/h",
                        difficulty: "easy"
                    },
                    {
                        question: "What is the next number in the sequence: 2, 6, 12, 20, ?",
                        options: ["28", "30", "32", "24"],
                        correct: 1,
                        explanation: "The pattern is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30",
                        difficulty: "hard"
                    },
                    {
                        question: "If 3x + 7 = 22, what is the value of x?",
                        options: ["5", "4", "6", "3"],
                        correct: 0,
                        explanation: "3x + 7 = 22, so 3x = 15, therefore x = 5",
                        difficulty: "medium"
                    },
                    {
                        question: "What is the area of a circle with radius 7 cm? (Use π = 22/7)",
                        options: ["154 cm²", "147 cm²", "161 cm²", "168 cm²"],
                        correct: 0,
                        explanation: "Area = πr² = (22/7) × 7² = (22/7) × 49 = 154 cm²",
                        difficulty: "medium"
                    },
                    {
                        question: "A number is increased by 20% and then decreased by 20%. What is the net change?",
                        options: ["No change", "4% decrease", "4% increase", "Cannot determine"],
                        correct: 1,
                        explanation: "Let x be the number. After 20% increase: 1.2x. After 20% decrease: 0.8 × 1.2x = 0.96x. Net change = 4% decrease",
                        difficulty: "hard"
                    },
                    {
                        question: "What is the sum of the first 10 natural numbers?",
                        options: ["45", "50", "55", "60"],
                        correct: 2,
                        explanation: "Sum = n(n+1)/2 = 10×11/2 = 55",
                        difficulty: "easy"
                    },
                    {
                        question: "If 2^x = 8, what is x?",
                        options: ["2", "3", "4", "1"],
                        correct: 1,
                        explanation: "2^x = 8, so 2^x = 2³, therefore x = 3",
                        difficulty: "medium"
                    },
                    {
                        question: "What is the probability of getting a head when flipping a fair coin?",
                        options: ["1/4", "1/2", "3/4", "1"],
                        correct: 1,
                        explanation: "A fair coin has 2 equally likely outcomes: head or tail. Probability of head = 1/2",
                        difficulty: "easy"
                    },
                    {
                        question: "What is the value of √(144 + 25)?",
                        options: ["13", "12", "17", "15"],
                        correct: 0,
                        explanation: "√(144 + 25) = √169 = 13",
                        difficulty: "medium"
                    }
                ]
            },
            logical: {
                timePerQuestion: 45,
                questions: [
                    {
                        question: "All roses are flowers. Some flowers are red. Which statement is definitely true?",
                        options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
                        correct: 3,
                        explanation: "We know all roses are flowers and some flowers are red, but we cannot determine if any roses are red.",
                        difficulty: "hard"
                    },
                    {
                        question: "If today is Wednesday, what day will it be 100 days from now?",
                        options: ["Thursday", "Friday", "Saturday", "Sunday"],
                        correct: 1,
                        explanation: "100 ÷ 7 = 14 weeks and 2 days. Wednesday + 2 days = Friday",
                        difficulty: "medium"
                    },
                    {
                        question: "A, B, C, D are sitting in a row. A is not at either end. B is next to C. D is at one end. Who is in the middle?",
                        options: ["A", "B", "C", "Cannot be determined"],
                        correct: 0,
                        explanation: "If D is at one end and A is not at either end, A must be in the middle.",
                        difficulty: "hard"
                    },
                    {
                        question: "If RED = 18, BLUE = 21, what does GREEN equal?",
                        options: ["33", "34", "35", "36"],
                        correct: 2,
                        explanation: "Each letter represents its position in alphabet: R(18)+E(5)+D(4)=27, but pattern suggests sum-9. G(7)+R(18)+E(5)+E(5)+N(14)=49, 49-14=35",
                        difficulty: "hard"
                    },
                    {
                        question: "Complete the pattern: 1, 4, 9, 16, ?",
                        options: ["20", "24", "25", "30"],
                        correct: 2,
                        explanation: "These are perfect squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25",
                        difficulty: "medium"
                    },
                    {
                        question: "If some cats are black and all black things absorb heat, then:",
                        options: ["All cats absorb heat", "Some cats absorb heat", "No cats absorb heat", "Cannot be determined"],
                        correct: 1,
                        explanation: "Some cats are black, and all black things absorb heat, so some cats absorb heat.",
                        difficulty: "hard"
                    },
                    {
                        question: "What comes next: 2, 4, 8, 16, ?",
                        options: ["24", "32", "20", "18"],
                        correct: 1,
                        explanation: "Each number is double the previous: 2×2=4, 4×2=8, 8×2=16, 16×2=32",
                        difficulty: "easy"
                    },
                    {
                        question: "If A is taller than B, and B is taller than C, then:",
                        options: ["A is tallest", "C is shortest", "Both A and C", "Cannot be determined"],
                        correct: 2,
                        explanation: "A > B > C, so A is tallest and C is shortest.",
                        difficulty: "easy"
                    }
                ]
            },
            verbal: {
                timePerQuestion: 25,
                questions: [
                    {
                        question: "What is the synonym of 'BENEVOLENT'?",
                        options: ["Malevolent", "Kind", "Stubborn", "Lazy"],
                        correct: 1,
                        explanation: "Benevolent means kind, generous, or well-meaning.",
                        difficulty: "medium"
                    },
                    {
                        question: "Which word is the antonym of 'EPHEMERAL'?",
                        options: ["Temporary", "Permanent", "Brief", "Fleeting"],
                        correct: 1,
                        explanation: "Ephemeral means lasting for a very short time, so permanent is its opposite.",
                        difficulty: "hard"
                    },
                    {
                        question: "Complete the analogy: BOOK is to LIBRARY as MONEY is to ?",
                        options: ["Bank", "Wallet", "Store", "ATM"],
                        correct: 0,
                        explanation: "Books are stored in libraries, just as money is stored in banks.",
                        difficulty: "medium"
                    },
                    {
                        question: "What does 'SERENDIPITY' mean?",
                        options: ["Bad luck", "Good fortune by accident", "Hard work", "Intelligence"],
                        correct: 1,
                        explanation: "Serendipity means the occurrence of events by chance in a happy way.",
                        difficulty: "hard"
                    },
                    {
                        question: "Which sentence is grammatically correct?",
                        options: ["He don't like apples", "He doesn't like apples", "He doesn't likes apples", "He don't likes apples"],
                        correct: 1,
                        explanation: "The correct form is 'He doesn't like apples' - third person singular with 'doesn't' and base form of verb.",
                        difficulty: "easy"
                    },
                    {
                        question: "What is the meaning of 'UBIQUITOUS'?",
                        options: ["Rare", "Present everywhere", "Expensive", "Beautiful"],
                        correct: 1,
                        explanation: "Ubiquitous means present, appearing, or found everywhere.",
                        difficulty: "hard"
                    },
                    {
                        question: "Choose the correct spelling:",
                        options: ["Accomodate", "Accommodate", "Acommodate", "Accomadate"],
                        correct: 1,
                        explanation: "The correct spelling is 'Accommodate' with double 'c' and double 'm'.",
                        difficulty: "medium"
                    },
                    {
                        question: "What is the plural of 'Crisis'?",
                        options: ["Crisises", "Crises", "Crisis", "Crisi"],
                        correct: 1,
                        explanation: "The plural of 'crisis' is 'crises'.",
                        difficulty: "medium"
                    },
                    {
                        question: "Which word means 'to make something less severe'?",
                        options: ["Aggravate", "Alleviate", "Amplify", "Accelerate"],
                        correct: 1,
                        explanation: "Alleviate means to make something less severe or painful.",
                        difficulty: "medium"
                    },
                    {
                        question: "What is the meaning of 'PERSPICACIOUS'?",
                        options: ["Confused", "Having keen insight", "Slow", "Angry"],
                        correct: 1,
                        explanation: "Perspicacious means having a ready insight into and understanding of things.",
                        difficulty: "hard"
                    },
                    {
                        question: "Choose the correct preposition: 'I am good ___ mathematics'",
                        options: ["at", "in", "on", "for"],
                        correct: 0,
                        explanation: "The correct preposition is 'at' - 'I am good at mathematics'.",
                        difficulty: "easy"
                    },
                    {
                        question: "What is the meaning of 'MAGNANIMOUS'?",
                        options: ["Small", "Generous in forgiving", "Angry", "Confused"],
                        correct: 1,
                        explanation: "Magnanimous means very generous or forgiving, especially toward a rival or less powerful person.",
                        difficulty: "hard"
                    }
                ]
            },
            spatial: {
                timePerQuestion: 40,
                questions: [
                    {
                        question: "If you fold a square piece of paper in half twice and cut a small triangle from the corner, how many holes will you have when you unfold it?",
                        options: ["1", "2", "4", "8"],
                        correct: 2,
                        explanation: "Folding twice creates 4 layers, so cutting one triangle creates 4 holes.",
                        difficulty: "medium"
                    },
                    {
                        question: "Which 3D shape has 6 faces, 12 edges, and 8 vertices?",
                        options: ["Cylinder", "Cube", "Sphere", "Pyramid"],
                        correct: 1,
                        explanation: "A cube has 6 square faces, 12 edges, and 8 vertices.",
                        difficulty: "easy"
                    },
                    {
                        question: "If you rotate a square 90 degrees clockwise, what will it look like?",
                        options: ["Same as original", "Upside down", "Rotated 90°", "Cannot determine"],
                        correct: 2,
                        explanation: "A square rotated 90 degrees clockwise will appear rotated but still be a square.",
                        difficulty: "easy"
                    },
                    {
                        question: "How many cubes are in a 3x3x3 cube?",
                        options: ["27", "26", "25", "24"],
                        correct: 0,
                        explanation: "A 3x3x3 cube contains 3 × 3 × 3 = 27 smaller cubes.",
                        difficulty: "medium"
                    },
                    {
                        question: "Which net can be folded to make a cube?",
                        options: ["6 squares in a line", "Cross shape with 6 squares", "L-shape with 6 squares", "All of the above"],
                        correct: 1,
                        explanation: "Only the cross shape with 6 squares can be folded into a cube.",
                        difficulty: "hard"
                    },
                    {
                        question: "If you look at a cube from the front, what do you see from the back?",
                        options: ["Same view", "Mirror image", "Rotated view", "Cannot determine"],
                        correct: 1,
                        explanation: "Looking at a cube from the back shows a mirror image of the front view.",
                        difficulty: "medium"
                    }
                ]
            },
            memory: {
                timePerQuestion: 20,
                questions: [
                    {
                        question: "Memorize this sequence: 7, 3, 9, 1, 5. What was the third number?",
                        options: ["7", "3", "9", "1"],
                        correct: 2,
                        explanation: "The sequence was 7, 3, 9, 1, 5. The third number is 9.",
                        difficulty: "easy"
                    },
                    {
                        question: "Remember these colors: Red, Blue, Green, Yellow. Which color was second?",
                        options: ["Red", "Blue", "Green", "Yellow"],
                        correct: 1,
                        explanation: "The sequence was Red, Blue, Green, Yellow. The second color is Blue.",
                        difficulty: "easy"
                    },
                    {
                        question: "Memorize: Apple, Banana, Cherry, Date. What fruit comes after Banana?",
                        options: ["Apple", "Banana", "Cherry", "Date"],
                        correct: 2,
                        explanation: "The sequence was Apple, Banana, Cherry, Date. After Banana comes Cherry.",
                        difficulty: "easy"
                    },
                    {
                        question: "Remember this pattern: ★, ●, ▲, ★, ●. What symbol is in the 4th position?",
                        options: ["★", "●", "▲", "Cannot remember"],
                        correct: 0,
                        explanation: "The pattern was ★, ●, ▲, ★, ●. The 4th position has ★.",
                        difficulty: "medium"
                    },
                    {
                        question: "Memorize these numbers: 2, 8, 4, 6, 1, 9. What is the sum of the first and last numbers?",
                        options: ["10", "11", "12", "13"],
                        correct: 1,
                        explanation: "The sequence was 2, 8, 4, 6, 1, 9. First number is 2, last is 9. Sum = 2 + 9 = 11.",
                        difficulty: "medium"
                    },
                    {
                        question: "Remember: Dog, Cat, Bird, Fish, Rabbit. Which animal is in the middle?",
                        options: ["Dog", "Cat", "Bird", "Fish"],
                        correct: 2,
                        explanation: "The sequence was Dog, Cat, Bird, Fish, Rabbit. The middle (3rd) animal is Bird.",
                        difficulty: "easy"
                    },
                    {
                        question: "Memorize this word sequence: HAPPY, SAD, ANGRY, EXCITED. What was the third word?",
                        options: ["HAPPY", "SAD", "ANGRY", "EXCITED"],
                        correct: 2,
                        explanation: "The sequence was HAPPY, SAD, ANGRY, EXCITED. The third word is ANGRY.",
                        difficulty: "easy"
                    },
                    {
                        question: "Remember these shapes: Circle, Square, Triangle, Circle, Square. What shape is in the 4th position?",
                        options: ["Circle", "Square", "Triangle", "Cannot remember"],
                        correct: 0,
                        explanation: "The sequence was Circle, Square, Triangle, Circle, Square. The 4th position has Circle.",
                        difficulty: "medium"
                    },
                    {
                        question: "Memorize: 5, 12, 8, 3, 15, 7. What is the largest number?",
                        options: ["12", "15", "8", "7"],
                        correct: 1,
                        explanation: "The sequence was 5, 12, 8, 3, 15, 7. The largest number is 15.",
                        difficulty: "medium"
                    },
                    {
                        question: "Remember these letters: M, A, T, H, S. What letter comes after T?",
                        options: ["M", "A", "T", "H"],
                        correct: 3,
                        explanation: "The sequence was M, A, T, H, S. After T comes H.",
                        difficulty: "easy"
                    },
                    {
                        question: "Memorize this pattern: 1, 4, 2, 5, 3, 6. What number is in the 5th position?",
                        options: ["1", "4", "2", "3"],
                        correct: 3,
                        explanation: "The sequence was 1, 4, 2, 5, 3, 6. The 5th position has 3.",
                        difficulty: "medium"
                    },
                    {
                        question: "Remember: Spring, Summer, Fall, Winter. Which season comes after Summer?",
                        options: ["Spring", "Summer", "Fall", "Winter"],
                        correct: 2,
                        explanation: "The sequence was Spring, Summer, Fall, Winter. After Summer comes Fall.",
                        difficulty: "easy"
                    },
                    {
                        question: "Memorize these colors: Purple, Orange, Pink, Blue, Green. What color was first?",
                        options: ["Purple", "Orange", "Pink", "Blue"],
                        correct: 0,
                        explanation: "The sequence was Purple, Orange, Pink, Blue, Green. The first color is Purple.",
                        difficulty: "easy"
                    },
                    {
                        question: "Remember this sequence: 9, 2, 7, 4, 1, 8. What is the smallest number?",
                        options: ["2", "1", "4", "7"],
                        correct: 1,
                        explanation: "The sequence was 9, 2, 7, 4, 1, 8. The smallest number is 1.",
                        difficulty: "medium"
                    },
                    {
                        question: "Memorize: Car, Bus, Train, Plane, Bike. Which vehicle is in the 3rd position?",
                        options: ["Car", "Bus", "Train", "Plane"],
                        correct: 2,
                        explanation: "The sequence was Car, Bus, Train, Plane, Bike. The 3rd position has Train.",
                        difficulty: "easy"
                    }
                ]
            },
            speed: {
                timePerQuestion: 15,
                questions: [
                    {
                        question: "What is 2 + 2?",
                        options: ["3", "4", "5", "6"],
                        correct: 1,
                        explanation: "2 + 2 = 4",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 5 × 3?",
                        options: ["12", "15", "18", "20"],
                        correct: 1,
                        explanation: "5 × 3 = 15",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 10 - 4?",
                        options: ["5", "6", "7", "8"],
                        correct: 1,
                        explanation: "10 - 4 = 6",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 8 ÷ 2?",
                        options: ["3", "4", "5", "6"],
                        correct: 1,
                        explanation: "8 ÷ 2 = 4",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 3²?",
                        options: ["6", "9", "12", "15"],
                        correct: 1,
                        explanation: "3² = 3 × 3 = 9",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 7 + 8?",
                        options: ["14", "15", "16", "17"],
                        correct: 1,
                        explanation: "7 + 8 = 15",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 12 - 5?",
                        options: ["6", "7", "8", "9"],
                        correct: 1,
                        explanation: "12 - 5 = 7",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 4 × 6?",
                        options: ["20", "22", "24", "26"],
                        correct: 2,
                        explanation: "4 × 6 = 24",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 15 ÷ 3?",
                        options: ["4", "5", "6", "7"],
                        correct: 1,
                        explanation: "15 ÷ 3 = 5",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 6 + 9?",
                        options: ["14", "15", "16", "17"],
                        correct: 1,
                        explanation: "6 + 9 = 15",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 11 - 3?",
                        options: ["7", "8", "9", "10"],
                        correct: 1,
                        explanation: "11 - 3 = 8",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 3 × 7?",
                        options: ["20", "21", "22", "23"],
                        correct: 1,
                        explanation: "3 × 7 = 21",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 18 ÷ 2?",
                        options: ["8", "9", "10", "11"],
                        correct: 1,
                        explanation: "18 ÷ 2 = 9",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 5 + 12?",
                        options: ["16", "17", "18", "19"],
                        correct: 1,
                        explanation: "5 + 12 = 17",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 20 - 7?",
                        options: ["12", "13", "14", "15"],
                        correct: 1,
                        explanation: "20 - 7 = 13",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 2 × 9?",
                        options: ["16", "17", "18", "19"],
                        correct: 2,
                        explanation: "2 × 9 = 18",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 14 ÷ 2?",
                        options: ["6", "7", "8", "9"],
                        correct: 1,
                        explanation: "14 ÷ 2 = 7",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 8 + 7?",
                        options: ["14", "15", "16", "17"],
                        correct: 1,
                        explanation: "8 + 7 = 15",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 16 - 8?",
                        options: ["7", "8", "9", "10"],
                        correct: 1,
                        explanation: "16 - 8 = 8",
                        difficulty: "easy"
                    },
                    {
                        question: "What is 6 × 4?",
                        options: ["22", "23", "24", "25"],
                        correct: 2,
                        explanation: "6 × 4 = 24",
                        difficulty: "easy"
                    }
                ]
            }
        };
        return configs[category];
    }

    shuffleQuestions() {
        for (let i = this.gameQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameQuestions[i], this.gameQuestions[j]] = [this.gameQuestions[j], this.gameQuestions[i]];
        }
    }

    showGameModal() {
        const modal = document.getElementById('game-modal');
        const gameTitle = document.getElementById('game-title');
        const categoryNames = {
            mathematical: 'Mathematical Reasoning',
            logical: 'Logical Reasoning',
            verbal: 'Verbal Ability',
            spatial: 'Spatial Reasoning',
            memory: 'Memory Challenge',
            speed: 'Speed Test'
        };
        
        gameTitle.textContent = categoryNames[this.currentGame];
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.gameQuestions.length) {
            this.endGame();
            return;
        }

        const question = this.gameQuestions[this.currentQuestionIndex];
        const gameContainer = document.getElementById('game-container');
        
        this.updateGameHeader();
        this.renderQuestion(question, gameContainer);
        this.resetTimer();
    }

    updateGameHeader() {
        document.getElementById('question-counter').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.gameQuestions.length}`;
        document.getElementById('score-display').textContent = `Score: ${this.gameScore}`;
    }

    renderQuestion(question, container) {
        let questionHTML = `
            <div class="question-container">
                <div class="question-text">${question.question}</div>
                <div class="question-options">
        `;

        question.options.forEach((option, index) => {
            questionHTML += `
                <button class="option-btn" onclick="gameEngine.selectOption(${index})" data-index="${index}">
                    ${option}
                </button>
            `;
        });

        questionHTML += `
                </div>
                <div class="game-controls">
                    <button class="btn btn-outline" onclick="gameEngine.skipQuestion()">Skip</button>
                    <button class="btn btn-primary" id="submit-btn" onclick="gameEngine.submitAnswer()" disabled>Submit</button>
                </div>
            </div>
        `;

        container.innerHTML = questionHTML;
    }

    selectOption(optionIndex) {
        // Remove previous selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to clicked option
        const selectedBtn = document.querySelector(`[data-index="${optionIndex}"]`);
        selectedBtn.classList.add('selected');
        
        // Enable submit button
        document.getElementById('submit-btn').disabled = false;
        
        // Store selected option
        this.gameQuestions[this.currentQuestionIndex].selectedOption = optionIndex;
        
        this.playSound('select');
    }

    submitAnswer() {
        const question = this.gameQuestions[this.currentQuestionIndex];
        const selectedOption = question.selectedOption;
        
        if (selectedOption === undefined) {
            this.showNotification('Please select an option', 'error');
            return;
        }

        const isCorrect = selectedOption === question.correct;
        
        if (isCorrect) {
            this.gameScore += 10;
            this.correctAnswers++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            this.playSound('correct');
        } else {
            this.wrongAnswers++;
            this.streak = 0;
            this.playSound('incorrect');
        }

        this.showAnswerFeedback(question, selectedOption, isCorrect);
    }

    showAnswerFeedback(question, selectedOption, isCorrect) {
        // Disable all options
        document.querySelectorAll('.option-btn').forEach((btn, index) => {
            btn.disabled = true;
            if (index === question.correct) {
                btn.classList.add('correct');
            } else if (index === selectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Show explanation after delay
        setTimeout(() => {
            const gameContainer = document.getElementById('game-container');
            gameContainer.innerHTML += `
                <div class="game-result">
                    <div class="result-message">
                        <strong>${isCorrect ? 'Correct!' : 'Incorrect!'}</strong><br>
                        ${question.explanation}
                    </div>
                    <button class="btn btn-primary" onclick="gameEngine.nextQuestion()">Next Question</button>
                </div>
            `;
        }, 1500);
    }

    skipQuestion() {
        this.skippedAnswers++;
        this.streak = 0;
        this.nextQuestion();
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.loadQuestion();
    }

    startTimer() {
        this.timeLeft = this.totalTime;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        const timerProgress = document.getElementById('timer-progress');
        
        timerText.textContent = this.timeLeft;
        
        const progress = (this.timeLeft / this.totalTime) * 283;
        timerProgress.style.strokeDashoffset = 283 - progress;
        
        // Change color based on time left
        if (this.timeLeft <= 5) {
            timerProgress.style.stroke = '#ef4444';
            timerText.style.color = '#ef4444';
        } else if (this.timeLeft <= 10) {
            timerProgress.style.stroke = '#f59e0b';
            timerText.style.color = '#f59e0b';
        } else {
            timerProgress.style.stroke = '#fbbf24';
            timerText.style.color = 'white';
        }
    }

    resetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.startTimer();
    }

    timeUp() {
        clearInterval(this.timer);
        this.skippedAnswers++;
        this.streak = 0;
        this.playSound('timeUp');
        
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML += `
            <div class="game-result">
                <div class="result-message">
                    <strong>Time's up!</strong><br>
                    The correct answer was: ${this.gameQuestions[this.currentQuestionIndex].options[this.gameQuestions[this.currentQuestionIndex].correct]}
                </div>
                <button class="btn btn-primary" onclick="gameEngine.nextQuestion()">Next Question</button>
            </div>
        `;
    }

    endGame() {
        clearInterval(this.timer);
        const gameTime = Math.round((Date.now() - this.gameStartTime) / 1000);
        const percentage = Math.round((this.correctAnswers / this.gameQuestions.length) * 100);
        
        let message = '';
        let achievement = '';
        
        if (percentage >= 90) {
            message = 'Outstanding! You have mastered this category!';
            achievement = '🏆 Master';
        } else if (percentage >= 80) {
            message = 'Excellent work! You are very skilled in this area.';
            achievement = '🥇 Expert';
        } else if (percentage >= 70) {
            message = 'Great job! You have a good understanding.';
            achievement = '🥈 Advanced';
        } else if (percentage >= 60) {
            message = 'Good effort! Keep practicing to improve.';
            achievement = '🥉 Intermediate';
        } else {
            message = 'Keep practicing! You\'ll get better with time.';
            achievement = '📚 Beginner';
        }

        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = `
            <div class="game-result">
                <div class="result-title">Game Complete!</div>
                <div class="result-score">${this.gameScore}/${this.gameQuestions.length * 10}</div>
                <div class="result-message">${message}</div>
                <div class="achievement">${achievement}</div>
                
                <div class="result-stats">
                    <div class="stat-item">
                        <div class="stat-value">${this.correctAnswers}</div>
                        <div class="stat-label">Correct</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.wrongAnswers}</div>
                        <div class="stat-label">Wrong</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.skippedAnswers}</div>
                        <div class="stat-label">Skipped</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.maxStreak}</div>
                        <div class="stat-label">Best Streak</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.round(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}</div>
                        <div class="stat-label">Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${percentage}%</div>
                        <div class="stat-label">Accuracy</div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="btn btn-outline" onclick="gameEngine.closeGame()">Close</button>
                    <button class="btn btn-primary" onclick="gameEngine.startGame('${this.currentGame}')">Play Again</button>
                </div>
            </div>
        `;

        this.updateUserStats();
        this.playSound('gameComplete');
    }

    updateUserStats() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) return;

        user.stats.gamesPlayed++;
        user.stats.totalScore += this.gameScore;
        user.stats.averageScore = Math.round(user.stats.totalScore / user.stats.gamesPlayed);

        // Update category-specific stats
        if (!user.stats.categories) {
            user.stats.categories = {};
        }
        
        if (!user.stats.categories[this.currentGame]) {
            user.stats.categories[this.currentGame] = {
                gamesPlayed: 0,
                totalScore: 0,
                bestScore: 0,
                averageScore: 0
            };
        }
        
        const categoryStats = user.stats.categories[this.currentGame];
        categoryStats.gamesPlayed++;
        categoryStats.totalScore += this.gameScore;
        categoryStats.bestScore = Math.max(categoryStats.bestScore, this.gameScore);
        categoryStats.averageScore = Math.round(categoryStats.totalScore / categoryStats.gamesPlayed);

        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    }

    closeGame() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        document.getElementById('game-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;

        const frequencies = {
            select: 800,
            correct: 1000,
            incorrect: 400,
            timeUp: 300,
            gameStart: 1200,
            gameComplete: 1500
        };

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequencies[type] || 600, this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showLoginModal() {
        document.getElementById('login-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Initialize game engine
const gameEngine = new GameEngine();

// Global functions for HTML onclick events
function startGame(category) {
    gameEngine.startGame(category);
}

function closeGame() {
    gameEngine.closeGame();
}
