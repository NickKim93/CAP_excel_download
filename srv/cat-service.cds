using my.goods as my from '../db/data-model';

service CatalogService {
    @readonly entity Goods as projection on my.Goods;

    action downloadTemplate (ciNo: String, goods: array of Goods) returns String

}
