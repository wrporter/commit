# Commit

## TODO

- [ ] Add admin reporting.
  - Graphs of pay based on age. Showcase the average.
- [ ] Add user reporting.
  - Consistency in completing chores for each child.
- [ ] Ask AI to generate an initial chore chart for children based on their age.
- [ ] Add ability to export and import a family, and potentially more granular (people, chores, assignments, etc.).
- [ ] Allow parents to go in and update chores.
- [ ] Recognize child voice via Google Home/Alexa and allow them to complete their chores.
- [ ] Add dark mode.
- [ ] Allow users to select a date in the past or future in the chore chart to see what chores are on that day.
- [ ] Add ability to share a family or chore chart (view only?) with other users.

## Resources

- https://www.ramseysolutions.com/relationships/chores-for-kids
- https://www.aacap.org/AACAP/Families_and_Youth/Facts_for_Families/FFF-Guide/Chores_and_Children-125.aspx
- https://www.connectedparenting.com.au/blog/research-shows-kids-who-do-chores-are-more-successful-but-how-do-you-actually-get-your-child-to-do-them
- https://www.uvws.org/news/s94a63z7yun3fczjm80xh8fzivafkb
- https://mcc.gse.harvard.edu/whats-new/chores-caring-kids

Research suggests that children who do chores can develop important skills and become more independent, responsible, and confident. Chores can also help children learn to deal with frustration and delayed gratification.

Benefits of chores for children

- Self-esteem: Children who do chores may have higher self-esteem and feel good about themselves
- Responsibility: Children who do chores may become more responsible and independent
- Problem-solving: Chores can help children develop problem-solving skills
- Executive functions: Chores can help children develop executive functions, such as focus, planning, and remembering instructions
- Work ethic: Chores can help children develop a work ethic
- Empathy: Chores can help children develop empathy for others
- Brain function: Chores can improve brain function

How to encourage children to do chores

- Let children do chores their way
- Thank children for doing chores
- Have conversations about why chores are important
- Create a sense of teamwork by having children work together on projects

## Export & Import Database

1. Install Postgres CLI tools.
   ```shell
   brew install libpq
   echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
   ```
2. Export the database.
   ```shell
   docker exec postgres pg_dump -U postgres --column-inserts --data-only commit > dbexport.pgsql
   ```
3. Consider removing the Drizzle inserts from the file.
4. Import the database.

   ```shell
   docker exec -i postgres /bin/bash -c "psql -U postgres commit" < dbexport.pgsql

   ```
