export interface IService {
  // @ts-ignore
  list();

  // @ts-ignore
  find(criteria);
  // @ts-ignore
  getOne(id);
  // @ts-ignore
  update(data);
  // @ts-ignore
  create(data);
  // @ts-ignore
  remove(id);
}
