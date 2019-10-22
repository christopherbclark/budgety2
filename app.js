var budgetController = (function(){

    // Function constructors for Income and Expenses, to generate multiple Income and Expense objects from the user input. 

    var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
};

Expense.prototype.calcPercentage = function(totalInc) {
    if (totalInc > 0) {
        this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
        this.percentage = -1;
    }
};

    Expense.prototype.getPercentage = function() {
        return this.percentage
    };

var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this. value = value;
};

var calculateTotal = function(type) {

    var sum = 0;
    data.allItems[type].forEach(function(cur) {
        sum += cur.value;
    });


    data.allTotal[type] = sum;

}

// Directly below is the data structure to store all of the inputted income and expense items (objects), and then the totals as well. These are objects within the larger "data" object.

var data = {
    allItems:{
        inc: [],
        exp: []
    },
    allTotal:{
        inc: 0,
        exp: 0
    },
    budget: 0,
    percentage: -1
};



return {
    addItem: function (type, des, val) {
        var newItem, ID;

        //Create a new ID

        if (data.allItems[type].length > 0) {
    
            ID = data.allItems[type][data.allItems[type].length-1].id + 1;
    
        } else {
            ID = 0
        }
        
        //Create a new item based on inc or exp type

        if (type === 'exp') {
            newItem = new Expense (ID, des, val);
        }
        else if (type === 'inc'){
            newItem = new Income (ID, des, val);
        }

        //Push it into data structure

        data.allItems[type].push(newItem);
        return newItem;
    },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
            return current.id;
        });

        index = ids.indexOf(id);

        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }

    },

        calculateBudget: function() { 

            //Calculate the total income and the total expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the budget: total income - total expenses

            data.budget = data.allTotal.inc - data.allTotal.exp;

            //Calculate the % of income that was spent

            if (data.allTotal.inc > 0) {
                data.percentage = Math.round((data.allTotal.exp / data.allTotal.inc) * 100);
            } else {
                data.percentage = -1;
            }
            

        },

        calculatePercentages: function() {

        //1.
        data.allItems.exp.forEach(function(cur) {
            cur.calcPercentage(data.allTotal.inc);
        });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
        return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.allTotal.inc,
                totalExp: data.allTotal.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
})();

//**************************************************************************************************************** 

var UIcontroller = (function(){

var domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputAddButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
}

var formatNumber = function(num, type) {
    var numSplit, int, dec;
    //Code to add + or - before number, commas for thousands and exactly 2 decimal points.
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

    dec = numSplit[1];

    type === 'exp' ? sign = '-' : sign = '+';

    return ('exp' ? '-' :'+') + ' ' + int + '.' + dec;

};

var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
        callback (list[i], i);
    }
};

return {
        getInput: function () {
            return {
            type: document.querySelector(domStrings.inputType).value,
            description: document.querySelector(domStrings.inputDescription).value,
            value: parseFloat(document.querySelector(domStrings.inputValue).value)
        };
        },

        addListItem: function(obj, type) {
            
            // Create HTML string with placeholder text.
     
            var html, newHtml;
            if (type === 'inc') {
            element = domStrings.incomeContainer;

            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
            element = domStrings.expensesContainer;

            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data.

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM.

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function (selectorID) {
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = ""; //Clears the user input fields
            });

            fieldsArr[0].focus(); //Switches the cursor back to the inputDescription field on the UI

        },

        displayBudget: function (obj) { //This is where we update the UI with the budget info and %
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(domStrings.percentageLabel).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                    document.querySelector(domStrings.percentageLabel).textContent = '---';   
                }

        },

        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            finalMonth = months[month];
            
            document.querySelector(domStrings.dateLabel).textContent = finalMonth + ' ' + year;

        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(domStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                };
            });
            
        },

        changedType: function () {

            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue);

                nodeListForEach (fields, function(cur) {
                
                    cur.classList.toggle('red-focus');

                });

            document.querySelector(domStrings.inputAddButton).classList.toggle('red');

        },
        
        getDomStrings: function() {
            return domStrings;
            
        }
    }
})();

//**************************************************************************************************************** 
//GLOBAL APP CONTROLER
var controller = (function(budgetCtrl, UIctrl){

    var setupEventListeners = function () {

        var DOM = UIctrl.getDomStrings();

        document.querySelector(DOM.inputAddButton).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);

        document.addEventListener('keypress', function(e) {
            
            if (e.keyCode === 13 || e.which === 13) { // 13 is the keyCode for the Enter key
                ctrlAddItem();
            }
        });
    }

    var updateBudget = function() {

        //4. Calculate the budget
        budgetCtrl.calculateBudget();

        //4.5 Return the budget using a method

        var budget = budgetController.getBudget();

        //5. Display the budget on the UI

        UIcontroller.displayBudget(budget);

    };

    var updatePercentages = function() {
    
        //1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        //2. Get the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI
        UIctrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
     
        input = UIctrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) { //If statement to check input fields

            // 2. Add the item to the budget controller
     
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        UIcontroller.addListItem(newItem, input.type);

        //3. Clear the fields

        UIcontroller.clearFields();

        //6. Calc and update the budget using the updateBudget function coded above

        updateBudget();

        //7. Updates the percentages
        
        updatePercentages();

        }
    };

    
    
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

        }
// 1. Delete the item from the budget structure.
        budgetCtrl.deleteItem(type, ID);
// 2. Delete the item from the UI.
        UIctrl.deleteListItem(itemID);
// 3. Update and show the new budget. 
        updateBudget();
// 4. Update the percentages.
        updatePercentages();
    };

    return {
        init: function() {
            console.log('The application is running.');
            UIcontroller.displayMonth(),
            UIcontroller.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIcontroller);

controller.init();