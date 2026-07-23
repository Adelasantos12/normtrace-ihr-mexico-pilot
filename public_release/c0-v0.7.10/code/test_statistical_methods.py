import unittest

from statistical_methods import classify_alpha, pass_batch_margin


class TestPublicMethods(unittest.TestCase):
    def test_batch_rule_is_strict(self):
        self.assertTrue(pass_batch_margin([0.01, 0.099]))
        self.assertFalse(pass_batch_margin([0.01, 0.10]))

    def test_alpha_decisions(self):
        self.assertEqual(classify_alpha(0.81, 0.89, 0.04), "high")
        self.assertEqual(classify_alpha(0.70, 0.78, 0.04), "acceptable")
        self.assertEqual(classify_alpha(0.60, 0.65, 0.025), "below_threshold")
        self.assertEqual(classify_alpha(0.65, 0.70, 0.025), "inconclusive")


if __name__ == "__main__":
    unittest.main()
