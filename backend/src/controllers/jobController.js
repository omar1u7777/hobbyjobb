const { Op, fn, col, literal, where: sequelizeWhere } = require('sequelize');
const { Job, Category, User, Application } = require('../models');
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, JOB_STATUS } = require('../../config/constants');
const { geocode } = require('../utils/geocode');

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
});

const parseIntOrDefault = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const getJobs = async (req, res, next) => {
  try {
    const page = Math.max(parseIntOrDefault(req.query.page, 1), 1);
    const limit = Math.min(Math.max(parseIntOrDefault(req.query.limit, DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    // Geocode location search → distance-based filtering
    let geoLat = req.query.lat ? Number(req.query.lat) : null;
    let geoLng = req.query.lng ? Number(req.query.lng) : null;
    if (req.query.location && (!geoLat || !geoLng)) {
      const geo = await geocode(req.query.location);
      if (geo) {
        geoLat = geo.lat;
        geoLng = geo.lng;
      } else {
        // Fallback: text match if geocoding fails
        where.location = { [Op.iLike]: `%${req.query.location}%` };
      }
    }
    if (req.query.category) where.category_id = req.query.category;
    if (req.query.minPrice) where.price = { ...(where.price || {}), [Op.gte]: Number(req.query.minPrice) };
    if (req.query.maxPrice) where.price = { ...(where.price || {}), [Op.lte]: Number(req.query.maxPrice) };

    const include = [
      { model: Category, as: 'category' },
      {
        model: User,
        as: 'poster',
        attributes: ['id', 'name', 'location', 'avatar'],
      },
    ];

    const attributes = { include: [] };

    let distanceExpr = null;
    if (geoLat && geoLng) {
      const lat = geoLat;
      const lng = geoLng;
      const radius = Number(req.query.radius || 50);

      if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        return res.status(400).json({ success: false, message: 'lat, lng and radius must be valid numbers' });
      }

      distanceExpr = `6371 * acos(
        cos(radians(${lat})) *
        cos(radians(CAST("Job"."lat" AS double precision))) *
        cos(radians(CAST("Job"."lng" AS double precision)) - radians(${lng})) +
        sin(radians(${lat})) *
        sin(radians(CAST("Job"."lat" AS double precision)))
      )`;

      where.lat = { [Op.ne]: null };
      where.lng = { [Op.ne]: null };
      where[Op.and] = [sequelizeWhere(literal(distanceExpr), { [Op.lte]: radius })];
      attributes.include.push([literal(distanceExpr), 'distance_km']);
    }

    let order = [['created_at', 'DESC']];
    if (req.query.sort === 'newest') order = [['created_at', 'DESC']];
    if (req.query.sort === 'price_asc') order = [['price', 'ASC']];
    if (req.query.sort === 'price_desc') order = [['price', 'DESC']];
    if (req.query.sort === 'oldest') order = [['created_at', 'ASC']];
    if (req.query.sort === 'distance' && distanceExpr) order = [[literal(distanceExpr), 'ASC']];

    const { rows, count } = await Job.findAndCountAll({
      where,
      include,
      attributes,
      order,
      distinct: true,
      limit,
      offset,
    });

    return res.json({
      success: true,
      data: {
        jobs: rows,
        pagination: buildPagination(page, limit, count),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        {
          model: User,
          as: 'poster',
          attributes: ['id', 'name', 'location', 'avatar'],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applicationsCount = await Application.count({ where: { job_id: job.id } });

    return res.json({
      success: true,
      data: {
        job,
        applicationsCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { title, description, price, category_id, location, lat, lng, expires_at, date, hobby_type } = req.body;
    const resolvedExpiresAt = expires_at || date || null;

    if (!title || !description || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'title, description, price and category_id are required',
      });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category_id' });
    }

    // Auto-geocode location if lat/lng not provided
    let resolvedLat = lat ?? null;
    let resolvedLng = lng ?? null;
    let resolvedLocation = location || null;
    if (location && (!resolvedLat || !resolvedLng)) {
      const geo = await geocode(location);
      if (geo) {
        resolvedLat = geo.lat;
        resolvedLng = geo.lng;
        if (geo.city) resolvedLocation = geo.city;
      }
    }

    const job = await Job.create({
      title,
      description,
      price,
      category_id,
      location: resolvedLocation,
      lat: resolvedLat,
      lng: resolvedLng,
      hobby_type: hobby_type || null,
      expires_at: resolvedExpiresAt,
      status: JOB_STATUS.OPEN,
      poster_id: req.user.id,
    });

    const responseData = { job };
    if (req.hobbyWarning) {
      responseData.warning = req.hobbyWarning;
    }

    return res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    return next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.poster_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the job owner can update this job' });
    }

    const allowedFields = ['title', 'description', 'price', 'category_id', 'location', 'lat', 'lng', 'status', 'expires_at'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Auto-geocode if location changed but lat/lng not provided
    if (updates.location && !updates.lat && !updates.lng) {
      const geo = await geocode(updates.location);
      if (geo) {
        updates.lat = geo.lat;
        updates.lng = geo.lng;
        if (geo.city) updates.location = geo.city;
      }
    }

    if (updates.category_id) {
      const category = await Category.findByPk(updates.category_id);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category_id' });
      }
    }

    await job.update(updates);

    return res.json({
      success: true,
      data: { job },
    });
  } catch (error) {
    return next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.poster_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the job owner can delete this job' });
    }

    await job.destroy();

    return res.json({
      success: true,
      data: { message: 'Job deleted successfully' },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      where: { poster_id: req.user.id },
      include: [{ model: Category, as: 'category' }],
      attributes: {
        include: [
          [literal('(SELECT COUNT(*) FROM applications WHERE applications.job_id = "Job"."id")'), 'application_count'],
        ],
      },
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      data: { jobs },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
};
