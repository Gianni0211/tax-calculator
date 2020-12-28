
 /* ***************************************CONSTANTS FROM THE DOM*********************************** */

const form = document.getElementById('form');
const result = document.getElementById('result');
const resultBill = document.getElementById('resultBill');
const select = document.getElementById('select');
const quantityForm = document.getElementById('quantityForm');
const clearBtn = document.getElementById('clearBtn');

//items array
let items = [];

/* *********************************************EVENT LISTENERS************************************** */

form.addEventListener('submit', e => {
 e.preventDefault(); //stops the send of the form to the server
if(select.value == 'Select item' || quantityForm.value <= 0 
|| select.value == 'Select item' && quantityForm.value <= 0 ){

   // validation
  validation(select, quantityForm);
  }
else {
   // items creation
   let cat = select.value.split('|')[0]; //takes the category from the form
   let item = select.value.split('|')[1].split('at ')[0]; //takes just name of the item cutting the price out
   let quantity = +quantityForm.value;
   let price = +select.value.split(' ').pop()  // isolate the price from the value and multiply by the quantity
   
   let imported = select.value.search('imported'); // searches if the value contains the string 'imported', if it has it will assign the index, otherwise it will assign -1
   imported == -1 ? imported = false : imported = true; // if imported is == -1 it will transform imported to false and true otherwise
   let addedItem  = {
    item: item,
    price : itemTotalPrice(price, quantity),
    cat: cat,
    imported: imported,
    quantity: quantity
  
   } //creates the new items from the inputs inserted by the user
   addNewItem(addedItem) //adds the new item to the items array
   createBill(items, calculateTotal(items)); //creates a new bill with new data
   form.reset();
 }

});
// clears all the data 
clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  items = [];
  form.reset();
  resultBill.innerHTML = '';
  result.innerHTML = '';
})

/* ##########################################  FUNCTIONS  ################################################## */

//it creates the result bill
let createBill = (items,bill) => {
 
 resultBill.innerHTML = ''; //clears the bill before re run the function
 result.innerHTML = '';
 for (let i = 0; i < items.length; i++){ // this for loops creates the p elements with the informations in the items array
  let p = document.createElement('p');
  
  p.innerText = `${items[i].quantity} ${items[i].item} at ${roundToNearest(bill.taxedPrices[i]).toFixed(2)}` //adds the item, quantity and taxed price
  resultBill.appendChild(p);
 }
 
 // p elements that makes the bill
 let taxP = document.createElement('p');
 taxP.innerText = `Sales tax: ${roundToNearest(bill.salesTax).toFixed(2)}`;
 taxP.classList.add('tax'); //add the class tax to the p
 
 let totalP = document.createElement('p')
 totalP.innerText = `Total price: ${roundToNearest(bill.totalPrice).toFixed(2)}`;
 result.appendChild(taxP);
 result.appendChild(totalP);
 
}
// validates the form
let validation = (selected, quantity) => {
 
if (selected.value == 'Select item' && quantity.value <= 0){
 alert('Complete the form');
}
else if (selected.value == 'Select item' ){
 alert('Select an item')
}
else if (quantity.value <=0) {
  
  alert('Insert the quantity')
}
}

// calculate the total price for each item in the list
let itemTotalPrice = (price, quantity) => {
 return price * quantity;
}
// rounds to nearest 0.05 
let roundToNearest = (num) => {
let splittedNumber = num.toString().split('');
  let lastDigit = splittedNumber[splittedNumber.length -1];
  if (lastDigit  <5){
  lastDigit = 5;
  splittedNumber[splittedNumber.length -1 ] = lastDigit.toString();
  }
return +splittedNumber.join('');
}
// adds the new item to the items array and checkes if exists
let addNewItem = (item) => {

 if (items.length == 0){ //if the arry is empty, simply adds the new item
  items.push(item);
  
}
 else { // otherwise it checks if the item exists, if so, it sums the quantity of the existing item with the added one
        // or just adds the new item to the items list
  let exist = items.find( el => {
    return el.item == item.item
  });
  exist == undefined ?
  items.push(item) :
  items.map(el => {
    if(el.item == item.item){
     el.quantity = el.quantity + item.quantity; //it updates the quantity
     el.price = el.price + itemTotalPrice(item.price, item.quantity) //it updates the price
    }
  })
}
}

// apply taxes function
let applyTaxes = (cat, price,imported) => {
 const excepted = cat == 'books' || cat == 'food' || cat == 'medical' //saves the excepted good requirements in a variable
if (imported == true){ //this condition checks if the goods is imported
let importDuty = price * 0.05 //calculates the import duty of the good

return excepted 
?  
 +(price + importDuty).toFixed(2) //if the good is excepted then return the price with only the import duty applied
:  
 +((price + importDuty + (price * 0.1)).toFixed(2)); // else return the price with both the sales tax and import duty applied
}
else { // if the good is not imported
return excepted 
? price // if the good is excepted, the function returns the original price
: +(price + (price * 0.1)).toFixed(2); //else it only applies the 10% sales tax
}
}

//calculate total function

let calculateTotal = (items) => {
 // it calculates the total tax of the added items before applying the taxes
let beforeTaxTotalPrice = items
.map(el => {
  return  el.price;
})
.reduce((acc,curr) => {
return acc + curr
},0);
// it adds the taxes for the prices of each of the items
let taxedPrices = items
.map(el => {
return applyTaxes(el.cat,el.price,el.imported);
}); 
// it calculates the total price with taxes
let totalPrice = +taxedPrices.
reduce((acc, curr) => {
return acc + curr
},0).toFixed(2);
// it calculates the amount of the sales tax due for the whole bill
let totalSalesTax = +(totalPrice - beforeTaxTotalPrice).toFixed(2);
return {
salesTax: totalSalesTax,
totalPrice: totalPrice,
taxedPrices: taxedPrices
};
}



