import logging
import json
import unittest
import yaml
import utils


class integration_tests(unittest.TestCase):
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
            cls.test_cases = config['test_cases']

        with open(openapi_path) as openapi_file:
            cls.openapi = yaml.load(openapi_file)

    @classmethod
    def cleanup(cls):
        cls.session.close()

    # Test case: GET /account-indexes with account index filter
    def test_get_account_query_index(self, endpoint='account-indexes'):
        testing_indexes = ["AGR", "for", "ENG091", "eng261"]

        for index in testing_indexes:
            response = utils.make_request(self, endpoint, 200,
                                          params={'accountIndexCode': index})
            index_schema = utils.get_resource_schema(
                self, 'AccountIndexResourceObject')
            utils.check_schema(self, response, index_schema)

            response_data = response.json()['data']
            for resource in response_data:
                actual_index = resource['attributes']['accountIndexCode']
                self.assertTrue(actual_index.lower().startswith(index.lower()))

    # Test case: GET /account-indexes with organization filter
    def test_get_account_query_org(self, endpoint='account-indexes'):
        testing_org = ['110015', '154230', '160000', '160600']

        for org in testing_org:
            response = utils.make_request(self, endpoint, 200,
                                          params={'organizationCode': org})
            index_schema = utils.get_resource_schema(
                self, 'AccountIndexResourceObject')
            utils.check_schema(self, response, index_schema)

            response_data = response.json()['data']
            for resource in response_data:
                actual_org = resource['attributes']['organizationCode']
                self.assertEqual(actual_org, org)


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    # Setup logging level
    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv, exit=False)
    integration_tests.cleanup()
