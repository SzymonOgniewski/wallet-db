import * as transactionsSummaryService from "./service.js";
import Joi from "joi";
export const transactionsSummaryController = async (req, res, next) => {
  const { year, month } = req.query;
  const id = req.user._id;
  console.log(id);
  const schema = Joi.object({
    year: Joi.string().required(),
    month: Joi.string().required(),
  });
  const { error } = schema.validate({
    year: year,
    month: month,
  });

  if (error) return res.status(400).json(error.details[0].message);
  try {
    const result = await transactionsSummaryService.monthlySummaryForUser(
      id,
      year,
      month
    );

    let incomeSummary = 0;
    let expenseSummary = 0;

    result.forEach((item) => {
      if (item.categoryInfo[0]?.type === "INCOME") {
        incomeSummary += item.total;
      } else {
        expenseSummary += item.total;
      }
    });
    const response = {
      categoriesSummary: result.map((item) => ({
        name: item.categoryInfo[0]?.name,
        type: item.categoryInfo[0]?.type,
        total: item.total,
      })),
      incomeSummary: incomeSummary,
      expenseSummary: expenseSummary,
      periodTotal: incomeSummary - expenseSummary,
      year: year,
      month: month,
    };
    res.json({
      status: "success",
      code: 200,
      data: {
        response,
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};
