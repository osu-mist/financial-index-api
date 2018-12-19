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
        for index in self.test_cases['valid_account_index_query']:
            response = utils.make_request(self, endpoint, 200,
                                          params={'accountIndexCode': index})
            index_schema = utils.get_resource_schema(
                self, 'AccountIndexResourceObject')
            utils.check_schema(self, response, index_schema)

            response_data = response.json()['data']
            for resource in response_data:
                actual_index = resource['attributes']['accountIndexCode']
                self.assertTrue(actual_index.lower().startswith(index.lower()))

        for index in self.test_cases['invalid_account_index_query']:
            response = utils.make_request(self, endpoint, 400,
                                          params={'accountIndexCode': index})
            error_schema = utils.get_resource_schema(
                self, 'Error')
            utils.check_schema(self, response, error_schema)

    # Test case: GET /account-indexes with organization filter
    def test_get_account_query_org(self, endpoint='account-indexes'):
        for org in self.test_cases['valid_account_org_query']:
            response = utils.make_request(self, endpoint, 200,
                                          params={'organizationCode': org})
            index_schema = utils.get_resource_schema(
                self, 'AccountIndexResourceObject')
            utils.check_schema(self, response, index_schema)

            response_data = response.json()['data']
            for resource in response_data:
                actual_org = resource['attributes']['organizationCode']
                self.assertEqual(actual_org, org)

        for org in self.test_cases['invalid_account_org_query']:
            response = utils.make_request(self, endpoint, 400,
                                          params={'organizationCode': org})
            error_schema = utils.get_resource_schema(
                self, 'Error')
            utils.check_schema(self, response, error_schema)

    # Test case: GET /account-indexes/{accountIndexCode}
    def test_get_account_url_index(self, endpoint='account-indexes'):
        for index in self.test_cases['valid_account_index_url']:
            response = utils.make_request(self, f'{endpoint}/{index}', 200)
            index_schema = utils.get_resource_schema(
                self, 'AccountIndexResourceObject')
            utils.check_schema(self, response, index_schema)

            actual_index = response.json(
                )['data']['attributes']['accountIndexCode']
            self.assertEqual(actual_index, index)

        for index in self.test_cases['invalid_account_index_url']:
            response = utils.make_request(self, endpoint, 400)
            error_schema = utils.get_resource_schema(
                self, 'Error')
            utils.check_schema(self, response, error_schema)

    # Test case: GET /activity-codes with activity code filter
    def test_get_account_query_code(self, endpoint='activity-codes'):
        for code in self.test_cases['valid_activity_code_query']:
            response = utils.make_request(self, endpoint, 200,
                                          params={'activityCode': code})
            code_schema = utils.get_resource_schema(
                self, 'ActivityCodeResourceObject')
            utils.check_schema(self, response, code_schema)

            response_data = response.json()['data']
            for resource in response_data:
                actual_code = resource['attributes']['activityCode']
                self.assertTrue(actual_code.lower().startswith(code.lower()))

        for code in self.test_cases['invalid_activity_code_query']:
            response = utils.make_request(self, endpoint, 400,
                                          params={'activityCode': code})
            error_schema = utils.get_resource_schema(
                self, 'Error')
            utils.check_schema(self, response, error_schema)


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
