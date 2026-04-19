const { Op, fn, col, literal } = require('sequelize');
const { User, Job, Category, Payment, Message } = require('../models');

const HOBBY_LIMIT = 30000;
const HOBBY_WARN_THRESHOLD = 25000;

const parseMoney = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const resolveRiskLevel = (user) => {
  const total = parseMoney(user.hobby_total_year);

  if (user.hobby_limit_reached || total >= HOBBY_LIMIT) {
    return 'high';
  }

  if (user.hobby_warned || total >= HOBBY_WARN_THRESHOLD) {
    return 'medium';
  }

  return 'low';
};

const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalJobs,
      openJobs,
      flaggedAccounts,
      totalCategories,
      totalMessages,
      boostedJobs,
    ] = await Promise.all([
      User.count(),
      Job.count(),
      Job.count({ where: { status: 'open' } }),
      User.count({
        where: {
          [Op.or]: [
            { hobby_limit_reached: true },
            { hobby_warned: true },
            { hobby_total_year: { [Op.gte]: HOBBY_WARN_THRESHOLD } },
          ],
        },
      }),
      Category.count(),
      Message.count(),
      Job.count({ where: { is_boosted: true } }),
    ]);

    const revenue = await Payment.findOne({
      attributes: [
        [fn('COALESCE', fn('SUM', col('amount_total')), 0), 'gross_volume'],
        [fn('COALESCE', fn('SUM', col('amount_platform')), 0), 'platform_revenue'],
      ],
      where: { status: 'released' },
      raw: true,
    });

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalJobs,
          openJobs,
          flaggedAccounts,
          totalCategories,
          totalMessages,
          boostedJobs,
          grossVolume: parseMoney(revenue?.gross_volume),
          platformRevenue: parseMoney(revenue?.platform_revenue),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getFlaggedAccounts = async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const riskFilter = typeof req.query.risk === 'string' ? req.query.risk.toLowerCase() : '';

    const where = {
      [Op.or]: [
        { hobby_limit_reached: true },
        { hobby_warned: true },
        { hobby_total_year: { [Op.gte]: HOBBY_WARN_THRESHOLD } },
      ],
    };

    if (search) {
      where[Op.and] = [
        {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        },
      ];
    }

    const users = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'hobby_total_year',
        'hobby_job_count',
        'hobby_warned',
        'hobby_limit_reached',
        'created_at',
      ],
      where,
      order: [['hobby_total_year', 'DESC']],
      limit: 100,
    });

    const accounts = users
      .map((user) => {
        const income = parseMoney(user.hobby_total_year);
        const risk = resolveRiskLevel(user);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          hobbyTotalYear: income,
          hobbyJobCount: user.hobby_job_count,
          hobbyWarned: user.hobby_warned,
          hobbyLimitReached: user.hobby_limit_reached,
          risk,
          limitPercent: Math.round((income / HOBBY_LIMIT) * 100),
          createdAt: user.created_at,
        };
      })
      .filter((account) => {
        if (!riskFilter || riskFilter === 'all') {
          return true;
        }

        return account.risk === riskFilter;
      });

    return res.json({
      success: true,
      data: {
        accounts,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: [
        'id',
        'name',
        'icon',
        'description',
        'max_price',
        'created_at',
        'updated_at',
        [literal('(SELECT COUNT(*) FROM jobs j WHERE j.category_id = "Category"."id")'), 'jobs_count'],
      ],
      order: [['name', 'ASC']],
    });

    return res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    return next(error);
  }
};

const createAdminCategory = async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const icon = typeof req.body.icon === 'string' ? req.body.icon.trim() : null;
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : null;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name is required',
      });
    }

    let maxPrice = null;
    if (req.body.max_price !== undefined && req.body.max_price !== null && req.body.max_price !== '') {
      maxPrice = Number.parseFloat(req.body.max_price);
      if (Number.isNaN(maxPrice) || maxPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'max_price must be a non-negative number',
        });
      }
    }

    const existing = await Category.findOne({ where: { name: { [Op.iLike]: name } } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists',
      });
    }

    const category = await Category.create({
      name,
      icon,
      description,
      max_price: maxPrice,
    });

    return res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
};

const updateAdminCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'name cannot be empty',
        });
      }

      const existing = await Category.findOne({
        where: {
          name: { [Op.iLike]: name },
          id: { [Op.ne]: category.id },
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Category name already exists',
        });
      }

      updates.name = name;
    }

    if (req.body.icon !== undefined) {
      updates.icon = typeof req.body.icon === 'string' ? req.body.icon.trim() : null;
    }

    if (req.body.description !== undefined) {
      updates.description = typeof req.body.description === 'string' ? req.body.description.trim() : null;
    }

    if (req.body.max_price !== undefined) {
      if (req.body.max_price === null || req.body.max_price === '') {
        updates.max_price = null;
      } else {
        const maxPrice = Number.parseFloat(req.body.max_price);
        if (Number.isNaN(maxPrice) || maxPrice < 0) {
          return res.status(400).json({
            success: false,
            message: 'max_price must be a non-negative number',
          });
        }
        updates.max_price = maxPrice;
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    await category.update(updates);

    return res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAdminCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const jobsCount = await Job.count({ where: { category_id: category.id } });
    if (jobsCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete category with active job references',
      });
    }

    await category.destroy();

    return res.json({
      success: true,
      message: 'Category deleted',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAdminStats,
  getFlaggedAccounts,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
};
