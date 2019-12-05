"""Integration tests"""
import json
import logging
import unittest
import yaml

from prance import ResolvingParser

import utils


class IntegrationTests(utils.UtilsTestCase):
    """Integration tests class"""

    @classmethod
    def setup(cls, config_path, openapi_path):
        """Performs basic setup"""

        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
            cls.test_cases = config['test_cases']
            cls.local_test = config['local_test']

        with open(openapi_path) as openapi_file:
            openapi = yaml.load(openapi_file, Loader=yaml.SafeLoader)
            if 'swagger' in openapi:
                backend = 'flex'
            elif 'openapi' in openapi:
                backend = 'openapi-spec-validator'
            else:
                exit('Error: could not determine openapi document version')

        parser = ResolvingParser(openapi_path, backend=backend)
        cls.openapi = parser.specification

    @classmethod
    def tearDownClass(cls):
        cls.session.close()

    # Test case: GET /account-indexes with account index filter
    def test_valid_get_account_index_query(self):
        for account_index in self.test_cases['valid_account_index_query']:
            self.check_endpoint(
                endpoint='account-indexes',
                resource='AccountIndexResource',
                response_code=200,
                query_params={'accountIndexCode': account_index},
                nullable_fields=[
                    'terminationDate',
                    'accountCode',
                    'accountTitle',
                    'activityCode',
                    'activityTitle',
                    'locationCode',
                    'locationTitle'
                ]
            )

    # Test case: GET /account-indexes with organization filter
    def test_valid_get_account_org_query(self):
        for account_org in self.test_cases['valid_account_org_query']:
            self.check_endpoint(
                endpoint='account-indexes',
                resource='AccountIndexResource',
                response_code=200,
                query_params={'organizationCode': account_org},
                nullable_fields=[
                    'terminationDate',
                    'accountCode',
                    'accountTitle',
                    'activityCode',
                    'activityTitle',
                    'locationCode',
                    'locationTitle'
                ]
            )

    # Test bad request /account-indexes with account index filter
    # and /account-indexes with organization filter
    def test_get_account_query_invalid_parameters(self):
        params = {
            'accountIndexCode': 'invalid_account_index_query',
            'organizationCode': 'invalid_account_org_query'
        }
        for key, test_case in params.items():
            for value in self.test_cases[test_case]:
                self.check_endpoint(
                    endpoint='account-indexes',
                    resource='ErrorObject',
                    response_code=400,
                    query_params={key: value}
                )

    # Test case: GET /account-indexes/{accountIndexCode}
    def test_valid_get_account_index_path(self):
        for account_index in self.test_cases['valid_account_index_path']:
            self.check_endpoint(
                endpoint=f'account-indexes/{account_index}',
                resource='AccountIndexResource',
                response_code=200,
                nullable_fields=[
                    'terminationDate',
                    'accountCode',
                    'accountTitle',
                    'activityCode',
                    'activityTitle',
                    'locationCode',
                    'locationTitle'
                ]
            )

    def test_invalid_get_account_index_path(self):
        for account_index in self.test_cases['invalid_account_index_path']:
            self.check_endpoint(
                endpoint=f'account-indexes/{account_index}',
                resource='ErrorObject',
                response_code=404
            )

    # Test case: GET /activity-codes with activity code filter
    def test_valid_get_activity_code_query(self):
        for activity_code in self.test_cases['valid_activity_code_query']:
            self.check_endpoint(
                endpoint='activity-codes',
                resource='ActivityCodeResource',
                response_code=200,
                query_params={'activityCode': activity_code},
                nullable_fields=[
                    'terminationDate'
                ]
            )

    def test_invalid_get_activity_code_query(self):
        for activity_code in self.test_cases['invalid_activity_code_query']:
            self.check_endpoint(
                endpoint='activity-codes',
                resource='ErrorObject',
                response_code=400,
                query_params={'activityCode': activity_code}
            )

    # Test case: GET /activity-codes/{activityCode}
    def test_valid_get_activity_code_path(self):
        for activity_code in self.test_cases['valid_activity_code_path']:
            self.check_endpoint(
                endpoint=f'activity-codes/{activity_code}',
                resource='ActivityCodeResource',
                response_code=200,
                nullable_fields=[
                    'terminationDate'
                ]
            )

    def test_invalid_activity_code_path(self):
        test_cases = self.test_cases['non_existing_activity_code_path']
        for activity_code in test_cases:
            self.check_endpoint(
                endpoint=f'activity-codes/{activity_code}',
                resource='ErrorObject',
                response_code=404
            )


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    # Setup logging level
    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    IntegrationTests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv)
