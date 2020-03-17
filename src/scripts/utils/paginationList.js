import React from 'react';
import variables from '../../styles/base/_variables.scss';
import Dictionary from './dictionary';

export const pageNumToId = (num) => {
  return `paginator-page-${num}`;
};

export const paginationList = (selected, pages, screenWidth) => {

  const listElements = [];

  const screenSmall = parseInt(variables.screenSmall);

  const noDotsLimit = 7; //If the number of pages are this number or below all numbers will be shown.
  const numbersInBeginning = 5; //If the selected page is below this number, all pages up and included this number will be shown.
  const numbersInEnd = 3; //How close to the end the selected page must be to show selected-1 and to end. 

  const dots = (key) => (
    <li id='paginator-dots' disabled={true} key={'dots: ' + key} className="dots">
      <div className="dots-text">
        ...
      </div>
    </li>);

  const numberElement = (page) => (
    <li key={page.toString()} className="list-element">
      <a href="#"
        id={pageNumToId(page)}
        data-page={page}
        aria-label={Dictionary.get('page') + ' ' + page + (page == selected && ', ' + Dictionary.get('currentPage'))}
        aria-current={page == selected}
      >
        {page}
      </a>  
    </li>);

  const arrow = (direction, active) => (
    <li key={direction} className={`list-element ${active ? '' : "disabled"}`} >
      <a href="#"
        id={direction}
        data-page={direction}
        id={`paginator-${direction == '-1' ? 'previous' : 'next'}`}
        disabled={!active}
        aria-label={Dictionary.get(`${direction == '-1' ? 'previous' : 'next'}Page`)}
      >
        {direction == '-1' ? '<' : '>'}
      </a>
    </li>
  );

  //Previous button
  listElements.push(arrow('-1', selected > 1));


  //Pages

  //Don't have enough pages to create dots
  if (pages <= noDotsLimit && screenWidth > screenSmall) {
    for (let i = 1; i <= pages; i++) {
      listElements.push(numberElement(i));
    }
  }

  else {
    //Small screen
    if (screenWidth < screenSmall) {
      for (let i = selected - 1; i < (selected + 2); i++) {
        if (i > 0 && i <= pages) {
          listElements.push(numberElement(i));
        }
      }
    }

    //Close to beginning
    else if (selected < numbersInBeginning) {
      for (let i = 1; i < numbersInBeginning + 1; i++) {
        listElements.push(numberElement(i));
      }
      listElements.push(dots('end'));
      listElements.push(numberElement(pages));
    }

    //Close to end
    else if (selected > pages - numbersInEnd) {
      listElements.push(numberElement(1));
      listElements.push(dots('beginning'));
      for (let i = pages - numbersInEnd - 1; i <= pages; i++) {
        listElements.push(numberElement(i));
      }
    }

    //In the middle
    else {
      listElements.push(numberElement(1));
      listElements.push(dots('beginning'));
      for (let i = selected - 1; i < (selected + 2); i++) {
        listElements.push(numberElement(i));
      }
      listElements.push(dots('end'));
      listElements.push(numberElement(pages));
    }
  }
  //Next button
  listElements.push(arrow('+1', selected < pages));
  return listElements;
};