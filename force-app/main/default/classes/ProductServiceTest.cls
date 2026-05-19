@isTest
private class ProductServiceTest {

    @isTest static void testInitializeWhenEmpty() {
        // Ensure no products initially in test context
        Integer before = [SELECT COUNT() FROM Product__c];
        Test.startTest();
        ProductService.initializeProducts();
        Test.stopTest();

        List<Product__c> products = ProductService.getProducts();
        System.assert(products.size() > 0, 'initializeProducts should insert sample products when none exist');
    }

    @isTest static void testCreateUpdateDeleteGet() {
        Test.startTest();
        // create
        Product__c created = ProductService.createProduct(
            'UNIT TEST BIKE', 'Mountain', 'Beginner', 'Aluminum', 1234, 'unit test desc', 'https://example.com/img.jpg'
        );
        System.assertNotEquals(null, created.Id, 'Created product must have Id');

        // get by id
        Product__c fetched = ProductService.getProductById(created.Id);
        System.assertEquals('UNIT TEST BIKE', fetched.Name, 'Name should match created value');

        // update
        Product__c updated = ProductService.updateProduct(
            created.Id, 'UPDATED BIKE', 'Commuter', 'Racer', 'Carbon', 2000, 'updated desc', 'https://example.com/img2.jpg'
        );
        System.assertEquals(created.Id, updated.Id);
        Product__c fetched2 = ProductService.getProductById(created.Id);
        System.assertEquals('UPDATED BIKE', fetched2.Name, 'Name should be updated');

        // delete
        ProductService.deleteProduct(created.Id);
        // verify deletion
        Integer cnt = [SELECT COUNT() FROM Product__c WHERE Id = :created.Id];
        System.assertEquals(0, cnt, 'Product should be deleted');

        Test.stopTest();
    }

    @isTest static void testInitializeWhenNotEmpty() {
        // insert one record so initializeProducts returns early
        Product__c p = new Product__c(Name='TMP_PRODUCT', Category__c='Test', Description__c='t', Level__c='Beginner', MSRP__c=1, Material__c='Steel');
        insert p;

        Test.startTest();
        // should not throw and should not duplicate when products exist
        ProductService.initializeProducts();
        Test.stopTest();

        Product__c q = [SELECT Id FROM Product__c WHERE Id = :p.Id LIMIT 1];
        System.assertNotEquals(null, q);
    }

    @isTest static void testGetProductByIdNull() {
        // calling with null should return null (cover branch)
        Test.startTest();
        Product__c result = ProductService.getProductById(null);
        Test.stopTest();
        System.assertEquals(null, result, 'getProductById(null) should return null');
    }
}
