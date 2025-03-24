import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeExpenseIdToInteger1710123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing primary key and dependencies
    await queryRunner.query(`ALTER TABLE expenses DROP CONSTRAINT IF EXISTS "PK_expenses"`);
    
    // Create sequence for auto-incrementing ID
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS expenses_id_seq`);
    
    // Change ID column type and make it use the sequence
    await queryRunner.query(`
      ALTER TABLE expenses 
      ALTER COLUMN id TYPE integer USING (CASE 
        WHEN id IS NULL THEN nextval('expenses_id_seq')
        ELSE CAST(encode(uuid_send(id::uuid), 'hex') AS integer)
      END),
      ALTER COLUMN id SET DEFAULT nextval('expenses_id_seq'),
      ADD PRIMARY KEY (id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
    await queryRunner.query(`ALTER TABLE expenses DROP CONSTRAINT IF EXISTS "PK_expenses"`);
    await queryRunner.query(`ALTER TABLE expenses ALTER COLUMN id TYPE uuid USING uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE expenses ADD PRIMARY KEY (id)`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS expenses_id_seq`);
  }
}  