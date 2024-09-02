export class Pager {
    totalItems: number = 0;
    currentPage: number = 1;
    pageSize: number = 0;
    totalPages: number = 0;
    startPage: number = 0;
    endPage: number = 0;
    startIndex: number = 0;
    endIndex: number = 0;
    pages: Array<number> = [];
  
    constructor(pager?: Pager) {
      if (pager) {
        this.totalItems = pager.totalItems;
        this.currentPage = pager.currentPage;
        this.pageSize = pager.pageSize;
        this.totalPages = pager.totalPages;
        this.startPage = pager.startPage;
        this.endPage = pager.endPage;
        this.startIndex = pager.startIndex;
        this.endIndex = pager.endIndex;
        this.pages = pager.pages;
      }
    }
  }
  