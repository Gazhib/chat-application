/**
 * models.js — PostgreSQL data-access layer.
 *
 * Each *Queries object exposes named async functions that accept plain values
 * and return plain JS objects shaped to match the API contracts previously
 * provided by the Mongoose models (fields renamed to camelCase, _id preserved,
 * nested objects like cipher / status rebuilt from flat columns).
 */

const pool = require("./db");

// ─── Row mappers ────────────────────────────────────────────────────────────

const mapUser = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    email: row.email,
    login: row.login,
    createdAt: row.created_at,
    role: row.role,
    password: row.password,
    isVerified: row.is_verified,
    publicKey: row.public_key,
    keyVersion: row.key_version ?? 0,
    keyUpdatedAt: row.key_updated_at,
    description: row.description,
    profilePicture: row.profile_picture,
    verifyCode: row.verify_code,
    verifyCodeExpires: row.verify_code_expires,
  };
};

const mapChat = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    chatType: row.chat_type,
    creatorId: row.creator_id,
    createdAt: row.created_at,
    // array_agg returns null when no rows; normalise to []
    membershipIds: row.membership_ids ? row.membership_ids.filter(Boolean) : [],
  };
};

const mapMessage = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    createdAt: row.created_at,
    messageType: row.message_type,
    status: {
      delievered: row.status_delivered, // intentional spelling from original schema
      read: row.status_read,
    },
    cipher:
      row.cipher_iv != null
        ? { iv: row.cipher_iv, data: row.cipher_data }
        : null,
    encVersion: row.enc_version ?? 1,
    picture: row.picture,
    finishedAt: row.finished_at,
    roomId: row.room_id,
  };
};

const mapCallRoom = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    creatorId: row.creator_id,
    createdAt: row.created_at,
    roomId: row.room_id,
    membershipIds: row.membership_ids ? row.membership_ids.filter(Boolean) : [],
  };
};

// ─── Chat helpers ────────────────────────────────────────────────────────────

// Returns a chat row with its membership_ids aggregated.
const CHAT_WITH_MEMBERS = `
  SELECT c.id, c.chat_type, c.creator_id, c.created_at,
         array_agg(cm.user_id ORDER BY cm.joined_at) AS membership_ids
  FROM   chats c
  JOIN   chat_members cm ON cm.chat_id = c.id
`;

// ─── userQueries ─────────────────────────────────────────────────────────────

const userQueries = {
  /** Find a user by primary key. */
  async findById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return mapUser(rows[0]);
  },

  /** Find a user whose login matches exactly. */
  async findByLogin(login) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE login = $1 LIMIT 1",
      [login]
    );
    return mapUser(rows[0]);
  },

  /** Find a user whose email matches exactly. */
  async findByEmail(email) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    return mapUser(rows[0]);
  },

  /** Find a user by email AND verify_code (used during email verification). */
  async findByEmailAndCode(email, verifyCode) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND verify_code = $2 LIMIT 1",
      [email, verifyCode]
    );
    return mapUser(rows[0]);
  },

  /**
   * Search users by login substring (case-insensitive), returns id / login /
   * profile_picture only, capped at 15 results.
   */
  async searchByLogin(pattern) {
    const { rows } = await pool.query(
      `SELECT id, login, profile_picture
       FROM   users
       WHERE  login ILIKE $1
       LIMIT  15`,
      [`%${pattern}%`]
    );
    return rows.map(mapUser);
  },

  /** Fetch multiple users by an array of UUIDs (id + login + profile_picture). */
  async findManyByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const { rows } = await pool.query(
      "SELECT id, login, profile_picture FROM users WHERE id = ANY($1::uuid[])",
      [ids]
    );
    return rows.map(mapUser);
  },

  /** Insert a new user row. */
  async create({ email, login, role, password, verifyCode, verifyCodeExpires }) {
    const { rows } = await pool.query(
      `INSERT INTO users
         (email, login, role, password, is_verified, verify_code, verify_code_expires)
       VALUES ($1, $2, $3, $4, false, $5, $6)
       RETURNING *`,
      [email, login, role ?? "USER", password, verifyCode ?? null, verifyCodeExpires ?? null]
    );
    return mapUser(rows[0]);
  },

  /**
   * Partial update — only the keys provided in `updates` are written.
   * Supported keys: isVerified, publicKey, keyVersion, keyUpdatedAt,
   *                 description, profilePicture, verifyCode, verifyCodeExpires.
   */
  async updateById(id, updates) {
    const colMap = {
      isVerified: "is_verified",
      publicKey: "public_key",
      keyVersion: "key_version",
      keyUpdatedAt: "key_updated_at",
      description: "description",
      profilePicture: "profile_picture",
      verifyCode: "verify_code",
      verifyCodeExpires: "verify_code_expires",
    };

    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [jsKey, col] of Object.entries(colMap)) {
      if (jsKey in updates) {
        setClauses.push(`${col} = $${idx++}`);
        // undefined → NULL
        values.push(updates[jsKey] === undefined ? null : updates[jsKey]);
      }
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return mapUser(rows[0]);
  },

  /** Hard-delete a user by email (used when verification code expires). */
  async deleteByEmail(email) {
    await pool.query("DELETE FROM users WHERE email = $1", [email]);
  },
};

// ─── chatQueries ─────────────────────────────────────────────────────────────

const chatQueries = {
  /** Find a chat by id, including all member UUIDs. */
  async findById(chatId) {
    const { rows } = await pool.query(
      `${CHAT_WITH_MEMBERS} WHERE c.id = $1 GROUP BY c.id`,
      [chatId]
    );
    return mapChat(rows[0]);
  },

  /**
   * Find a chat that contains a specific userId AND has a specific chat id.
   * Used for the companion endpoint.
   */
  async findByIdAndMember(chatId, userId) {
    const { rows } = await pool.query(
      `${CHAT_WITH_MEMBERS}
       WHERE c.id = $1
         AND EXISTS (
           SELECT 1 FROM chat_members
           WHERE  chat_id = c.id AND user_id = $2
         )
       GROUP BY c.id`,
      [chatId, userId]
    );
    return mapChat(rows[0]);
  },

  /**
   * Return all chats in which userId is a member (with full member lists).
   */
  async findAllByMember(userId) {
    const { rows } = await pool.query(
      `${CHAT_WITH_MEMBERS}
       WHERE c.id IN (
         SELECT chat_id FROM chat_members WHERE user_id = $1
       )
       GROUP BY c.id`,
      [userId]
    );
    return rows.map(mapChat);
  },

  /**
   * Create a new chat and insert all members in a single transaction.
   * Returns the mapped chat with membershipIds populated.
   */
  async create({ chatType, creatorId, membershipIds }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: [chat] } = await client.query(
        "INSERT INTO chats (chat_type, creator_id) VALUES ($1, $2) RETURNING *",
        [chatType ?? "DIRECT", creatorId]
      );

      for (const uid of membershipIds) {
        await client.query(
          "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)",
          [chat.id, uid]
        );
      }

      await client.query("COMMIT");
      return mapChat({ ...chat, membership_ids: membershipIds });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};

// ─── messageQueries ───────────────────────────────────────────────────────────

const messageQueries = {
  /** Find a single message by primary key. */
  async findById(id) {
    const { rows } = await pool.query("SELECT * FROM messages WHERE id = $1", [id]);
    return mapMessage(rows[0]);
  },

  /**
   * Cursor-based pagination: fetch up to `limit` messages in a chat, ordered
   * newest-first.  When `beforeId` is provided the page starts just before
   * that message (exclusive).
   */
  async findByChatPaginated({ chatId, beforeId, limit }) {
    let query, params;

    if (beforeId) {
      query = `
        WITH cursor_row AS (
          SELECT created_at, id FROM messages WHERE id = $2::uuid
        )
        SELECT m.*
        FROM   messages m, cursor_row c
        WHERE  m.chat_id = $1
          AND  (m.created_at < c.created_at
                OR (m.created_at = c.created_at AND m.id::text < c.id::text))
        ORDER  BY m.created_at DESC, m.id DESC
        LIMIT  $3
      `;
      params = [chatId, beforeId, limit];
    } else {
      query = `
        SELECT * FROM messages
        WHERE  chat_id = $1
        ORDER  BY created_at DESC, id DESC
        LIMIT  $2
      `;
      params = [chatId, limit];
    }

    const { rows } = await pool.query(query, params);
    return rows.map(mapMessage);
  },

  /**
   * Return the single most-recent message for each chat in `chatIds`.
   * Result is an array of mapped messages (one per chat that has messages).
   */
  async findLastPerChat(chatIds) {
    if (!chatIds || chatIds.length === 0) return [];
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (chat_id)  *
       FROM   messages
       WHERE  chat_id = ANY($1::uuid[])
       ORDER  BY chat_id, created_at DESC, id DESC`,
      [chatIds]
    );
    return rows.map(mapMessage);
  },

  /** Find the message associated with a call room (for marking finishedAt). */
  async findByRoomId(roomId) {
    const { rows } = await pool.query(
      "SELECT * FROM messages WHERE room_id = $1 LIMIT 1",
      [roomId]
    );
    return mapMessage(rows[0]);
  },

  /** Insert a new message row. */
  async create({
    chatId,
    senderId,
    messageType,
    cipher,
    encVersion,
    picture,
    roomId,
  }) {
    const { rows } = await pool.query(
      `INSERT INTO messages
         (chat_id, sender_id, message_type,
          cipher_iv, cipher_data, enc_version,
          picture, room_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        chatId,
        senderId,
        messageType ?? "txt",
        cipher?.iv ?? null,
        cipher?.data ?? null,
        encVersion ?? 1,
        picture ?? null,
        roomId ?? null,
      ]
    );
    return mapMessage(rows[0]);
  },

  /** Mark a message as delivered and read. */
  async markRead(id) {
    const { rows } = await pool.query(
      `UPDATE messages
       SET    status_delivered = 1, status_read = 1
       WHERE  id = $1
       RETURNING *`,
      [id]
    );
    return mapMessage(rows[0]);
  },

  /** Set the finished_at timestamp on a call message. */
  async markFinished(roomId) {
    await pool.query(
      `UPDATE messages SET finished_at = NOW()
       WHERE  room_id = $1 AND finished_at IS NULL`,
      [roomId]
    );
  },

  /** Hard-delete a message by primary key. */
  async deleteById(id) {
    await pool.query("DELETE FROM messages WHERE id = $1", [id]);
  },
};

// ─── callRoomQueries ──────────────────────────────────────────────────────────

const callRoomQueries = {
  /**
   * Returns true if userId is already in any active call room.
   */
  async memberIsInCall(userId) {
    const { rows } = await pool.query(
      "SELECT 1 FROM call_room_members WHERE user_id = $1 LIMIT 1",
      [userId]
    );
    return rows.length > 0;
  },

  /** Returns true if a call room with the given roomId already exists. */
  async roomIdExists(roomId) {
    const { rows } = await pool.query(
      "SELECT 1 FROM call_rooms WHERE room_id = $1 LIMIT 1",
      [roomId]
    );
    return rows.length > 0;
  },

  /**
   * Find a call room by its roomId, but only if userId is a member.
   * Returns null when not found or not a member.
   */
  async findByRoomIdAndMember(roomId, userId) {
    const { rows } = await pool.query(
      `SELECT cr.id, cr.creator_id, cr.created_at, cr.room_id,
              array_agg(crm.user_id) AS membership_ids
       FROM   call_rooms cr
       JOIN   call_room_members crm ON crm.call_room_id = cr.id
       WHERE  cr.room_id = $1
         AND  EXISTS (
               SELECT 1 FROM call_room_members
               WHERE  call_room_id = cr.id AND user_id = $2
             )
       GROUP  BY cr.id`,
      [roomId, userId]
    );
    return mapCallRoom(rows[0]);
  },

  /**
   * Create a call room and insert all members in a single transaction.
   */
  async create({ creatorId, roomId, membershipIds }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows: [callRoom] } = await client.query(
        "INSERT INTO call_rooms (creator_id, room_id) VALUES ($1, $2) RETURNING *",
        [creatorId, roomId]
      );

      for (const uid of membershipIds) {
        await client.query(
          "INSERT INTO call_room_members (call_room_id, user_id) VALUES ($1, $2)",
          [callRoom.id, uid]
        );
      }

      await client.query("COMMIT");
      return mapCallRoom({ ...callRoom, membership_ids: membershipIds });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /** Delete a call room (cascades to call_room_members). */
  async deleteById(id) {
    await pool.query("DELETE FROM call_rooms WHERE id = $1", [id]);
  },
};

module.exports = { userQueries, chatQueries, messageQueries, callRoomQueries };
