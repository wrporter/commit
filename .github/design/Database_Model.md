# ❌ families

Used to share access with other family members.

| Column     | Type        | Description |
|------------|-------------|-------------|
| id         | uuid        |             |
| name       | varchar(20) |             |
| created_at | timestamp   |             |
| created_by | uuid        |             |
| updated_at | timestamp   |             |
| updated_by | uuid        |             |

# ❌ family_users

| Column     | Type      | Description |
|------------|-----------|-------------|
| family_id  | uuid      |             |
| user_id    | uuid      |             |
| created_at | timestamp |             |
| created_by | uuid      |             |
| updated_at | timestamp |             |
| updated_by | uuid      |             |

# ✅ users

| Column           | Type         | Description |
|------------------|--------------|-------------|
| id               | uuid         |             |
| email            | varchar(40)  |             |
| first_name       | varchar(30)  |             |
| last_name        | varchar(30)  |             |
| display_name     | varchar(20)  |             |
| image_url        | varchar(250) |             |
| image            | bytea        |             |
| social_providers | jsonb        |             |
| password_hash    | text         |             |
| created_at       | timestamp    |             |
| created_by       | uuid         |             |
| updated_at       | timestamp    |             |
| updated_by       | uuid         |             |

# ✅ people

| Column     | Type        | Description |
|------------|-------------|-------------|
| id         | uuid        |             |
| family_id  | uuid        | ❌           |
| name       | varchar(20) |             |
| birthday   | date        |             |
| created_at | timestamp   |             |
| created_by | uuid        |             |
| updated_at | timestamp   |             |
| updated_by | uuid        |             |

# ✅ chores

| Column     | Type          | Description |
|------------|---------------|-------------|
| id         | uuid          |             |
| family_id  | uuid          | ❌           |
| image      | bytea         |             |
| name       | varchar(20)   |             |
| reward     | numeric(16,4) |             |
| created_at | timestamp     |             |
| created_by | uuid          |             |
| updated_at | timestamp     |             |
| updated_by | uuid          |             |

# ❌ chore_rewards

TODO: Delete this table in favor of a single reward for a chore with a graded commission system.

# ✅ chore_assignments

**TODO:** How to make chores optional or have multiple options? For example, if a house has 3 bathrooms, we want to rotate between them. The bathrooms can also be of different size, so the payment amount should be different for bigger/smaller jobs.

| Column      | Type      | Description                                                                        |
|-------------|-----------|------------------------------------------------------------------------------------|
| id          | uuid      |                                                                                    |
| family_id   | uuid      |                                                                                    |
| person_id   | uuid      |                                                                                    |
| chore_id    | uuid      |                                                                                    |
| day_of_week | smallint  | Days 0-6 map to a TypeScript enum, staring on Monday (0) and ending on Sunday (6). |
| created_at  | timestamp |                                                                                    |
| created_by  | uuid      |                                                                                    |
| updated_at  | timestamp |                                                                                    |
| updated_by  | uuid      |                                                                                    |

# ✅ commissions

Commission amounts can be adjusted based on performance with the following rating scale and adjustment amount.

1. **Unacceptable - 20%**
    - Ex: Has a very poor attitude, complaining or acting out. Does not complete the chore or does such a poor job that it's basically not done.
2. **Needs Improvement - 50%**
    - Ex: Does the bare minimum to quickly get the job done, but doesn't do it well to the point that it would need work to actually be done.
3. **Meets Expectations - 100%**
    - Ex: Gets the job done, perhaps by being reminded a couple times.
4. **Exceeds Expectations - 150%**
    - Ex: Considers extra details, such as moving furniture to vacuum and using the hose the get around the edges. Proactively finds out what their chore is and accomplishes it.
5. **Outstanding - 200%**
    - Ex: Works with a younger sibling while teaching them how to also do the chore. Goes above and beyond with the chore, considering other things that are near the area and may not be part of the chore, such as wiping baseboards or walls when mopping the floor.

For example, if the reward for a chore is worth \$1.00 and the child performs with an _Outstanding_ rating, the child's final payment amount would be \$2.00. On the other hand, if the rating is _Unacceptable_, the child would be paid \$0.20.

| Column       | Type          | Description                                                                       |
|--------------|---------------|-----------------------------------------------------------------------------------|
| id           | uuid          |                                                                                   |
| family_id    | uuid          | Family the person is in.                                                          |
| person_id    | uuid          | Person that performed the chore.                                                  |
| chore_id     | uuid          | Is NULL for ad-hoc chores.                                                        |
| chore_name   | uuid          | Is NULL for defined chores.                                                       |
| base_amount  | numeric(16,4) | Base amount the chore is worth.                                                   |
| rating       | smallint      | See above for the rating system.                                                  |
| final_amount | numeric(16,4) | Final amount to pay the child, based on the rating adjustment on the base amount. |
| date         | date          | Date the chore was completed.                                                     |
| created_at   | timestamp     |                                                                                   |
| updated_at   | timestamp     |                                                                                   |
