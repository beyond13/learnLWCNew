public with sharing class ProductService {
    @AuraEnabled(cacheable=true)
    public static List<Product__c> getProducts() {
        return [
            SELECT Id, Name, Category__c, Level__c, Material__c, MSRP__c, Description__c, Picture_URL__c
            FROM Product__c
            ORDER BY Name
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Product__c getProductById(Id productId) {
        if (productId == null) {
            return null;
        }
        return [
            SELECT Id, Name, Category__c, Level__c, Material__c, MSRP__c, Description__c, Picture_URL__c
            FROM Product__c
            WHERE Id = :productId
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static Product__c createProduct(String name, String category, String level, String material, Decimal msrp, String description, String pictureUrl) {
        Product__c product = new Product__c(
            Name = name,
            Category__c = category,
            Level__c = level,
            Material__c = material,
            MSRP__c = msrp,
            Description__c = description,
            Picture_URL__c = pictureUrl
        );
        insert product;
        return product;
    }

    @AuraEnabled
    public static Product__c updateProduct(Id productId, String name, String category, String level, String material, Decimal msrp, String description, String pictureUrl) {
        Product__c product = new Product__c(
            Id = productId,
            Name = name,
            Category__c = category,
            Level__c = level,
            Material__c = material,
            MSRP__c = msrp,
            Description__c = description,
            Picture_URL__c = pictureUrl
        );
        update product;
        return product;
    }

    @AuraEnabled
    public static void deleteProduct(Id productId) {
        if (productId != null) {
            delete new Product__c(Id = productId);
        }
    }

    @AuraEnabled
    public static void initializeProducts() {
        if ([SELECT COUNT() FROM Product__c] > 0) {
            return;
        }

        List<Product__c> products = new List<Product__c>{
            new Product__c(Name='DYNAMO X1', Category__c='Mountain', Description__c='A durable e-bike with great looks.', Level__c='Racer', MSRP__c=7800, Material__c='Carbon', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/dynamox1.jpg'),
            new Product__c(Name='DYNAMO X2', Category__c='Mountain', Description__c='A durable e-bike with great looks.', Level__c='Racer', MSRP__c=6802, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/dynamox2.jpg'),
            new Product__c(Name='DYNAMO X3', Category__c='Mountain', Description__c='A durable e-bike with great looks.', Level__c='Enthusiast', MSRP__c=5601, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/dynamox3.jpg'),
            new Product__c(Name='DYNAMO X4', Category__c='Mountain', Description__c='A durable e-bike with great looks.', Level__c='Enthusiast', MSRP__c=5500, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/dynamox4.jpg'),
            new Product__c(Name='FUSE X1', Category__c='Mountain', Description__c='A durable e-bike with great looks.', Level__c='Enthusiast', MSRP__c=4600, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/fusex1.jpg'),
            new Product__c(Name='ELECTRA X1', Category__c='Commuter', Description__c='A durable e-bike with great looks.', Level__c='Beginner', MSRP__c=3200, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/electrax1.jpg'),
            new Product__c(Name='ELECTRA X2', Category__c='Commuter', Description__c='A durable e-bike with great looks.', Level__c='Beginner', MSRP__c=3200, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/electrax2.jpg'),
            new Product__c(Name='ELECTRA X3', Category__c='Commuter', Description__c='A durable e-bike with great looks.', Level__c='Beginner', MSRP__c=2700, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/electrax3.jpg'),
            new Product__c(Name='ELECTRA X4', Category__c='Commuter', Description__c='A durable e-bike with great looks.', Level__c='Beginner', MSRP__c=2700, Material__c='Aluminum', Picture_URL__c='https://s3-us-west-2.amazonaws.com/dev-or-devrl-s3-bucket/sample-apps/ebikes/electrax4.jpg')
        };
        insert products;
    }
}
