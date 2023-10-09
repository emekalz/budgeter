// Budget Controller
var budgetController = (function(){
//    like conn to db ish using the conn details "like id".....   
    var Expense = function(id, description, value) 
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);   
        }
         else
         {
            this.percentage = -1;
         }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };


    var Income = function(id, description, value) 
    {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;            
        });
        data.totals[type] = sum;
        
    };

    var data = {

        allItems: {
            exp:[],
            inc:[]
        },
        totals:{
            exp:[],
            inc:[]
        },
        budget: 0,
        percentage: -1
    };

    return{
        additem: function (type, des, val) {
            
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
           
            // Create new item based on income/expense type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
          else if (type ==='inc') {
            newItem = new Income(ID, des, val);
          }

        //   Push items into our data structure (Items for Income and expenses)
          data.allItems[type].push(newItem);

        //   To return the new element
          return newItem;
        },


        // delete item
        deleteItem: function(type, id) {



            var ids, index;

            ids.data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget : Income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);  
            }
            else 
            {
                data.percentage = -1;
            }
        },

        // Percentage manipulation
        calculatePercentages: function() {

             data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc); 
             });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget:function()
        {
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing:function()
        {
            console.log(data);
        }
    }

})();



//  UI controller

var UIController = (function() {
//  initializing all parts of the app that are interactive
    // code
 
    var DOMstrings = {
        inputType: '.add-type',
        inputDescription: '.desc-block',
        inputValue: '.value-block',
        inputBtn: '.btn-check',
        incomeContainer: '.income-list',
        expensesContainer: '.expense-list',
        budgetLabel: '.budget-value',
        incomeLabel: '.budget-inc-val',
        expenseLabel: '.budget-exp-val',
        percentageLabel: '.budget-exp-percentage',
        container: '.contain',
        expensesPercLabel: '.item-percentage',
        dateLabel: '.budget-title-month'

    };


    var formatNumber = function(num, type)
        {
            // number manipulations
            num = Math.abs(num);
            num = num.toFixed(2); 

            numSplit = num.split('.');

            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }

            dec = numSplit[1];

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

        };

        var nodeListForEach = function(list, callback) {

            for (var i = 0; i < list.length; i++){
                callback(list[i], i);
            }
        };


    return{
        getinput: function () 
        {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // either income or expenses
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItems: function (obj, type) 
        {
            var html, newHtml; 
            // Create HTML string with placeholder text
            if (type === 'inc') 
            {
                element = DOMstrings.incomeContainer;

                html ='<div class="income-items" id="inc-%id%"><div class="item-description"><span class="desc-title">%description%</span><span class="item-value">%value%</span><span class="button"><button type="submit" class="item-delete" id="itemDelete"> <i class="fa fa-close"></i></button></span></div></div>';
            }
            else if (type === 'exp') 
            {
                element = DOMstrings.expensesContainer;

                html = '<div class="expense-items" id="exp-%id%"><div class="item-description"><span class="desc-title">%description%</span><span class="item-value">%value%</span><span class="item-percentage">21%</span><span class="button"><button type="submit" class="item-delete" id="itemDelete"> <i class="fa fa-close"></i></button></span></div></div>';  
            }
           
            //  Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);  
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },      


        // to clear all input after former data input 
        clearfields: function  () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp'); 
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = '----'
            }

        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else
                {
                    current.textContent = '----';
                }
               
            });
        },

        displayMonth: function() {
            var now, months, month, year;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
            'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);
        
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },
    
        getDOMstrings: function() 
        {
            return DOMstrings;
        }
    };

})();

// Global App Controller
// for the main event listeners

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keycode === 13 || event.which === 13) {
            ctrlAddItem();
            }
        });
        

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    };





    var updateBudget = function() {

        // 1. Calculate the budget
       budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
       UICtrl.displayBudget(budget);


    };


    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetController.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
         
    // 1. Get the field input data
    var input = UICtrl.getinput();

        // to only update field when an item is added
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
               
    // 2. Add the item to the budget controller
    newItem =  budgetCtrl.additem(input.type, input.description, input.value);

    // 3. Add the item to the UI
    UICtrl.addListItems(newItem, input.type);

    // 4. Clear the fields
    UICtrl.clearfields();

    // 5. Calculate and update the budget
        updateBudget();

    // 6. Calculate and update the percentages
            updatePercentages();
    
        
        }
    };
   
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id; 
        
        // inc
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //  3. Update and show the new budget
            updateBudget();
        }
    };

    return{
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListeners();
        }
    };
   
})(budgetController, UIController);

controller.init();