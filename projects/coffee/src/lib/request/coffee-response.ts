import { Pager } from '.';

export class FilterResponse<Model> {
  data: Array<Model>;
  pager: Pager;

  constructor(data?: Array<Model>, pager?: Pager) {
    if (data) {
      this.data = data;
    } else {
      this.data = [];
    }

    if (pager) {
      this.pager = new Pager(pager);
    } else {
      this.pager = new Pager();
    }
  }
}
