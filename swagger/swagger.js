/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTransaction:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount used in the transaction
 *         comment:
 *           type: string
 *           description: Short comment about the transaction
 *         transactionDate:
 *           type: string
 *           description: Timestamp of the transaction creation time - default Date.now()
 *         categoryId:
 *           type: string
 *           description: ID of the category chosen during the transaction creation process
 *
 *     UpdateTransaction:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount used in the transaction
 *         comment:
 *           type: string
 *           description: Short comment about the transaction
 *         type:
 *           type: string
 *           description: Type of the transaction (INCOME/EXPENSE)
 *         transactionDate:
 *           type: string
 *           format: date
 *           description: Timestamp of the transaction creation time - default Date.now()
 *         balanceAfter:
 *           type: integer
 *           description: Balance of the user's account after the transaction
 *         categoryName:
 *           type: string
 *           description: Name of the category chosen during the transaction creation process
 *
 *     DeleteTransaction:
 *       type: object
 *       required:
 *         - transactionId
 *       properties:
 *         transactionId:
 *           type: string
 *           description: ID of the transaction to delete
 *
 *     GetAllUserTransactions:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user for which transactions are searched
 *
 *     CreateTransactionWithIds:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount used in the transaction
 *         comment:
 *           type: string
 *           description: Short comment about the transaction
 *         type:
 *           type: string
 *           description: Type of the transaction (INCOME/EXPENSE)
 *         transactionDate:
 *           type: string
 *           description: Timestamp of the transaction creation time - default Date.now()
 *         balanceAfter:
 *           type: integer
 *           description: Balance of the user's account after the transaction
 *         categoryName:
 *           type: string
 *           description: Name of the category chosen during the transaction creation process
 *         userId:
 *           type: string
 *           description: The ID of the user
 *         transactionId:
 *           type: string
 *           description: The ID of the transaction
 *
 *     UserRegister:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User's email
 *         password:
 *           type: string
 *           description: User's password
 *
 *     UserWithToken:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User's email
 *         token:
 *           type: string
 *           description: User's token
 *
 *     CurrentUserData:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User's email
 *         balance:
 *           type: number
 *           description: current user's balance
 *
 *     TransactionCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: transactionId
 *         name:
 *           type: string
 *           description: Category name
 *         type:
 *           type: string
 *           description: Category type
 */
/**
 * @swagger
 * tags:
 *   name: Transactions
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransaction'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTransactionWithIds'
 *       400:
 *         description: Field amount is required // validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get user's transactions
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/CreateTransactionWithIds'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 * /api/transactions/{transactionId}:
 *   patch:
 *     summary: Update existing user's transaction
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransaction'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTransactionWithIds'
 *       400:
 *         description: validation failed // invalid categoryId
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete user's transaction
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found - invalid transactionId
 *       500:
 *         description: Internal server error
 * /api/transactions/categories:
 *   get:
 *     summary: Get list of transaction categories
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransaction'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/TransactionCategory'
 *       400:
 *         description: validation failed // invalid categoryId
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 * /api/users/sign-up:
 *   post:
 *     summary: Create a new account
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: validation failed
 *       409:
 *         description: Email is already taken
 *       500:
 *         description: Internal server error
 * /api/users/sign-in:
 *   post:
 *     summary: Sign in
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       200:
 *         description: Signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserWithToken'
 *       400:
 *         description: Wrong email or password // account not verified
 *       500:
 *         description: Internal server error
 * /api/users/sign-out:
 *   get:
 *     summary: Sign out
 *     tags: [User Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Signed out
 *       401:
 *         description: Unauthorized
 * /api/users/current:
 *   get:
 *     summary: Check current user
 *     tags: [User Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: current user data
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrentUserData'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error


 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
