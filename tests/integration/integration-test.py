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
    def test_valid_get_account_index_query(self):
        utils.test_query_request(
            self, endpoint='account-indexes',
            resource='AccountIndexResourceObject',
            response_code=200,
            param='accountIndexCode',
            test_cases=self.test_cases['valid_account_index_query'],
            test_assertion=utils.assertion_tests.actual_starts_with_test)

    # Test case: GET /account-indexes with organization filter
    def test_valid_get_account_org_query(self):
        utils.test_query_request(
            self, endpoint='account-indexes',
            resource='AccountIndexResourceObject',
            response_code=200,
            param='organizationCode',
            test_cases=self.test_cases['valid_account_org_query'],
            test_assertion=utils.assertion_tests.actual_equals_test_str)

    # Test bad request /account-indexes with account index filter
    # and /account-indexes with organization filter
    def test_get_account_query_invalid_parameters(self):
        params = {
            'accountIndexCode': 'invalid_account_index_query',
            'organizationCode': 'invalid_account_org_query'
        }
        for param, test_case in params.items():
            utils.test_query_request(
                self, endpoint='account-indexes',
                resource='Error',
                response_code=400,
                param=param,
                test_cases=self.test_cases[test_case])

    # Test case: GET /account-indexes/{accountIndexCode}
    def test_valid_get_account_index_path(self):
        utils.test_path_request(
            self, endpoint='account-indexes',
            resource='AccountIndexResourceObject',
            response_code=200,
            param='accountIndexCode',
            test_cases=self.test_cases['valid_account_index_path'],
            test_assertion=utils.assertion_tests.actual_equals_test_str)

    def test_invalid_get_account_index_path(self):
        utils.test_path_request(
            self, endpoint='account-indexes',
            resource='Error',
            response_code=404,
            test_cases=self.test_cases['invalid_account_index_path'])

    # Test case: GET /activity-codes with activity code filter
    def test_valid_get_activity_code_query(self):
        utils.test_query_request(
            self, endpoint='activity-codes',
            resource='ActivityCodeResourceObject',
            response_code=200,
            param='activityCode',
            test_cases=self.test_cases['valid_activity_code_query'],
            test_assertion=utils.assertion_tests.actual_starts_with_test)

    def test_invalid_get_activity_code_query(self):
        utils.test_query_request(
            self, endpoint='activity-codes',
            resource='Error',
            response_code=400,
            param='activityCode',
            test_cases=self.test_cases['invalid_activity_code_query'])

    # Test case: GET /activity-codes/{activityCode}
    def test_valid_get_activity_code_path(self):
        utils.test_path_request(
            self, endpoint='activity-codes',
            resource='ActivityCodeResourceObject',
            response_code=200,
            param='activityCode',
            test_cases=self.test_cases['valid_activity_code_path'],
            test_assertion=utils.assertion_tests.actual_equals_test_str)

    def test_invalid_activity_code_path(self):
        utils.test_path_request(
            self, endpoint='activity-codes',
            resource='Error',
            response_code=404,
            test_cases=self.test_cases['non_existing_activity_code_path'])


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
