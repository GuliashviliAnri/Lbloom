# LBLOOM საბაღე ცენტრი

სრული Next.js / React / TypeScript / Tailwind CSS საიტი Supabase მონაცემთა ბაზით, ადმინისტრირებითა და Storage ატვირთვებით. ეს არის არსებული საიტის GitHub-ზე ასატვირთი, სტანდარტული Next.js ვერსია. დიზაინი და ფუნქციები შენარჩუნებულია, მათ შორის ერთიანი SVG ისრები, უცვლელი „ნახვა“ ღილაკის ფერი და ოდნავ მომრგვალებული ბრაუზერის ლოგო.

## ლოკალურად გაშვება

საჭიროა Node.js 22.13 ან უფრო ახალი ვერსია.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

გახსენით http://localhost:3000. ადმინისტრირება: http://localhost:3000/admin.

## Production შემოწმება

```bash
npm run build
npm start
```

`npm run build` და TypeScript-ის შემოწმება წარმატებით შესრულდა ამ ვერსიაზე. არქივში არ შედის node_modules, build output, Git ისტორია ან ადმინისტრატორის პაროლი.

## GitHub-ზე ატვირთვა

ZIP გახსენით და პროექტის საქაღალდის შიგთავსი განათავსეთ ახალი repository-ის ფესვში — იქ, სადაც package.json დევს. Git ბრძანებებით:

```bash
git init
git add .
git commit -m "Initial LBLOOM website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

.env.local არ ატვირთოთ. .env.example შეიცავს Supabase-ის საჯარო publishable გასაღებს; ადმინისტრატორის წვდომას იცავს Supabase Auth და RLS.

## ჰოსტინგზე გაშვება

პროექტს სჭირდება Next.js-ის მხარდამჭერი ჰოსტინგი ან Node.js სერვერი. GitHub Pages-ის სტატიკური ჰოსტინგი ამ პროექტის სერვერულ გვერდებს ვერ გაუშვებს.

Next.js ჰოსტინგზე GitHub repository-ის მიერთებისას მიუთითეთ:

- Framework: Next.js
- Install command: npm ci
- Build command: npm run build
- Output directory: ავტომატური Next.js პარამეტრი
- Root directory: ის საქაღალდე, სადაც package.json დევს

ჰოსტინგის Environment Variables-ში დაამატეთ .env.example-ის ორივე მნიშვნელობა:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://sdmnhcjtppqkmdvkzocm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_cfYrbvrSyLHwhW4FbhPg1Q_W_D9PprU
```

შემდეგ გაუშვით Deploy. თუ ამ ცვლადებს შეცვლით, ხელახლა ააგეთ და გამოაქვეყნეთ საიტი.

არსებულ Supabase პროექტთან დაკავშირებისას იგივე პროდუქტები, ფოტოები, ვიდეოები და ადმინისტრატორის ანგარიში დარჩება. მონაცემთა ბაზის და Storage-ის სარეზერვო ასლი ZIP-ში არ არის; ისინი Supabase-ში რჩება.

## Supabase / SQL

ერთიანი განახლებული სკრიპტია `supabase/setup.sql`; იგივე ასლი არის `public/database-setup.sql`.

თუ არსებული პროექტი უკვე მუშაობს და ამ სკრიპტის მიმდინარე ვერსია გაშვებულია, ხელახლა გაშვება აუცილებელი არ არის. ახალი პროექტის ან სქემის განახლების შემთხვევაში Supabase SQL Editor-ში გაუშვით სრული `supabase/setup.sql`. სკრიპტი არ შლის პროდუქტებს, ამბებსა და ატვირთულ ფოტოებს. ბოლო შედეგი საჭირო ცხრილებსა და გადასახედ სხვა ცხრილებს აჩვენებს; უცნობი ცხრილები ავტომატურად არ იშლება.

ცხრილები: categories, products, furniture, services, videos, garden_stories, site_settings, admins. Storage bucket-ები: product-images, video-thumbnails, videos.

ადმინისტრატორი შექმენით Supabase Dashboard → Authentication → Users-დან. შემდეგ SQL Editor-ში მის Auth UUID-ს მიეცით წვდომა:

```sql
insert into public.admins (user_id)
values ('ADMIN_AUTH_UUID')
on conflict (user_id) do nothing;
```

შემდეგ შედით `/admin`-ზე ამ მომხმარებლის ელფოსტითა და პაროლით. ჩვეულებრივი მომხმარებლების რეგისტრაცია საიტზე არ არის. Supabase-ში საჯარო რეგისტრაციის გამორთვა შესაძლებელია Auth პარამეტრებიდან.

ახალი დომენის გამოყენებისას Supabase Authentication → URL Configuration-ში Site URL და საჭირო Redirect URLs მოარგეთ თქვენს დომენს. service_role ან სხვა პრივილეგირებული გასაღები ბრაუზერში არ გამოიყენოთ.

## გვერდები და ფუნქციები

მთავარი გვერდის სექციები: საბაღე ამბები, მცენარეები, ჩვენი ვიდეოები, ეზოს ავეჯი, ჩვენი სერვისები, კონტაქტი. მცენარეებისა და ეზოს ავეჯის კატალოგებს აქვს ძიება და კატეგორიის ფილტრი. პროდუქტის გვერდებზე არის ფოტოგალერეა, ფოტოს გადიდება, ფასდაკლების ძველი/ახალი ფასი და WhatsApp/Messenger ბმულები. ვიდეოები იხსნება საიტზე მოდალში. ამბებს აქვთ თარიღები და დეტალური გვერდები.

Admin Panel მართავს პროდუქტებს, ეზოს ავეჯს, მათ კატეგორიებს, ფოტოებს, სერვისებს, ამბებს, ვიდეოებსა და საკონტაქტო მონაცემებს. ვიდეოს ფაილისა და ფოტოების ატვირთვა ხდება Supabase Storage-ში.

ონლაინ კალათა და გადახდები არ არის დამატებული. ადმინისტრირების სრული CRUD და Storage ატვირთვის საბოლოო შემოწმება ახალ დომენზე ჩაატარეთ თქვენი ადმინისტრატორის ანგარიშით.

## ფოტოები

საიტის ამჟამინდელი ადგილობრივი ფოტოები და ოპტიმიზებული ვარიანტები სრულად მოყვება პროექტს. საილუსტრაციო ფოტოებზე შენარჩუნებულია შესაბამისი აღნიშვნა პროდუქტის გვერდზე. Supabase Storage-ის ფოტოები იტვირთება არსებული გარე ბმულებით.

## თარიღის ფორმატისა და hydration-ის შესწორება

თარიღები და ფასები აღარ ეყრდნობა ბრაუზერის Georgian ICU მხარდაჭერას. ამბის თარიღი ყოველთვის ქართულად ჩანს, თბილისის დროით. შემოწმებები: `npm test` (5 ტესტი).
