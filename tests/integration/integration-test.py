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
    def test_get_account_query_index(self):
        utils.test_request(
            self, endpoint='account-indexes',
            resource='AccountIndexResourceObject',
            response_code=200,
            param='accountIndexCode',
            test_cases=self.test_cases['valid_account_index_query'],
            test_assertion=utils.assertion_tests.actual_starts_with_test)

        utils.test_request(
            self, endpoint='account-indexes',
            resource='Error',
            response_code=400,
            param='accountIndexCode',
            test_cases=self.test_cases['invalid_account_index_query'])

    # Test case: GET /account-indexes with organization filter
    def test_get_account_query_org(self):
        utils.test_request(
            self, endpoint='account-indexes',
            resource='AccountIndexResourceObject',
            response_code=200,
            param='organizationCode',
            test_cases=self.test_cases['valid_account_org_query'],
            test_assertion=utils.assertion_tests.actual_equals_test_str)

        utils.test_request(
            self, endpoint='account-indexes',
            resource='Error',
            response_code=400,
            param='accountIndexCode',
            test_cases=self.test_cases['invalid_account_index_query'])

    # Test case: GET /account-indexes/{accountIndexCode}
    def test_get_account_url_index(self):
        utils.test_path_request(
            self, endpoint='account-indexes',
            resource='AccountIndexResourceObject',
            response_code=200,
            test_cases=self.test_cases['valid_account_index_query'],
            test_assertion=utils.assertion_tests.actual_equals_test_str)

        utils.test_path_request(
            self, endpoint='account-indexes',
            resource='Error',
            response_code=400,
            test_cases=self.test_cases['invalid_account_index_query'])

    # Test case: GET /activity-codes with activity code filter
    def test_get_activity_query_code(self):
        utils.test_request(
            self, endpoint='activity-codes',
            resource='ActivityCodeResourceObject',
            response_code=200,
            param='activityCode',
            test_cases=self.test_cases['valid_activity_code_query'],
            test_assertion=utils.assertion_tests.actual_starts_with_test)

        utils.test_request(
            self, endpoint='activity-codes',
            resource='Error',
            response_code=400,
            param='activityCode',
            test_cases=self.test_cases['invalid_activity_code_query'])

    # Test case: GET /activity-codes/{activityCode}
    def test_get_activity_url_code(self):
        utils.test_path_request(
            self, endpoint='activity-codes',
            resource='ActivityCodeResourceObject',
            response_code=200,
            test_cases=self.test_cases['valid_activity_code_url'],
            test_assertion=utils.assertion_tests.actual_equals_test_str)

        utils.test_path_request(
            self, endpoint='actiity-codes',
            resource='Error',
            response_code=200,
            test_cases=self.test_cases['invalid_activity_code_url'])


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
