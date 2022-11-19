<p align="center">
  <img width="300" alt="download (1)" src="https://user-images.githubusercontent.com/115484634/195130740-777d8ee1-7a00-4b1b-b93f-690bf2f0f823.png">
</p>

# Welcome to Bits'22

<img width="925" alt="Screenshot 2022-10-11 203718" src="https://user-images.githubusercontent.com/115484634/195128997-348ad069-92d8-419a-9897-e4cdabf63e8e.png">

Hello competitor. This is the official source code for the bits competition 2022. You can contribute to this code by giving us Bugs, Improvements etc. This repository is also participating in Hacktoberfest, so if you're also doing Hacktoberfest this is a great chance. Please refer below for more details.

## Technologies and Packages Used

 - NodeJS
 - mongoose
 - connect-mongo
 - dotenv
 - ejs
 - express
 - express-session
 - google-auth-library
 - google-apis
 - jsonwebtoken
 - nodemailer
 - nodemon
 - request
 - sweetalert2
 - sass

We also used some internal technologies in this code that are not shown in this list. 

## How to run the code
This code is mainly made using express. Please refer below to how to run this code correctly.

 1. First download ```Git``` from here: ```https://git-scm.com/downloads```. If you already installed it, skip this step.
 1. Clone this repository by running the below command or downloading the zip file for the code.
```bash
git clone https://github.com/acicts/BITS22
```
 2. Change the directory to the project folder
```bash
cd BITS22
```
 3.  Install the necessary dependencies. 
```bash
npm install --save
```
 4.  Go to the ```.env``` file and then follow the instructions below to fill the env file properly.

##

### How to fill ```.env``` file.

 - ```TOKEN``` is a random string that is used to identify admin users when logging in to the webpage. This token is added to the admin session when logged in. You can generate a random hash or input one you like.
 - ```REGISTER_ID```,```CODING_ID```,```DESIGN_ID```, ```EXPLORE_ID``` fields follows the same pattern and this is the trickiest to fill. First of all go to [Google Sheets](https://google.com/sheets) and sign up. After that follow the below steps.

    **Click on Blank**.
    
    <img width="923" alt="Screenshot 2022-10-10 215025" src="https://user-images.githubusercontent.com/115484634/194911706-aa635235-da70-498f-bbdc-6485e894c236.png">

    **Add the Spreadsheet name  as "Coding Tasks" and then copy the ID of the sheet. Do this process for the other 2 sheets too. Which are Design Tasks & Explore Tasks. After copying all 3 IDs go to ```.env``` file and then fill the ```CODING_ID```,```DESIGN_ID```,```EXPLORE_ID```. After this go to the spreadsheets again and then open the Coding Tasks sheet first.**

   **Click on the + button at the bottom of the page and then create Sub-Sheets in the order as specified below. (This process goes to the other 2 sheets too)**
   
   <img width="881" alt="Screenshot 2022-10-10 215248" src="https://user-images.githubusercontent.com/115484634/194912253-3808bf91-46f3-45f2-be92-ccac94b51dff.png">
   
   *Create Sub-Sheets in All 3 Sheets as specified below. (Please use these exact number when creating Sub-Sheets)*
   
    **Coding Tasks Sheet** -> *100, 200, 300, 400, 500, 600, 700, 800, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 5000, 5100, 5200, 5300, 5400, 5500, 5600, 5700, 5800, 5900, 6000, 6100, 6200, 8900, 9100, 9200, 9300*
    
    **Design Tasks Sheet** -> *900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200, 6300, 6400, 6500, 6600, 6700, 6800, 6900, 7000, 7100, 7200, 7300, 7400, 7500, 9400, 9500, 9600*
    
    **Explore Tasks Sheet** -> *1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 7600, 7700, 7800, 7900, 8000, 8100, 8200, 8300, 8400, 8500, 8600, 8700, 8800, 8900, 9000, 9700, 9800, 9900*

	You need a ```Google Service Account``` to get access to the spreadsheets API. We have to enable Google Sheets API in our project on Google developers console.

  **Go to the [Google developer console](https://console.cloud.google.com/) and then create a new project with any name you want. Please refer below if you don't know how to create a Google Project.**
  
<img width="957" alt="Screenshot 2022-10-10 213958" src="https://user-images.githubusercontent.com/115484634/194911172-608a986b-795d-455e-ae06-48997f971e47.png">


After creating the project go to the project dashboard and then click on **Enable APIs and Services** button. Search for **Google Sheets API** in the search bar and then once you see the result click on it and then click on **Enable**. 

<img width="914" alt="Screenshot 2022-10-10 215839" src="https://user-images.githubusercontent.com/115484634/194913113-16c366cf-4696-454a-9b8f-3f1e68f64b55.png">

Once you enable Google Sheets API in your project, you will see the page where you can configure the settings for this API. Click on the **Credentials** tab on the left sidebar. Here you will see a list of OAuth client IDs and service accounts. By default, there should be none.

Click on **Create Credentials** button at the top and select the **Service Account** option.
![enter image description here](https://i.imgur.com/K0VOMLo.png)

Enter the name and description of the service account and click **Create** button.
![enter image description here](https://i.imgur.com/R706EzO.png)

Click **Continue** on the next dialog

![enter image description here](https://i.imgur.com/06z3tvm.png)

On the next dialog, you get an option to create a key. This is an important step. Click on the **Create Key** button and choose **JSON** as the format. This will ask you to download the JSON file to your local machine.

For this tutorial, I have renamed the file and saved it as **credentials.json** on my local machine.

Keep it somewhere safe. This key file contains the credentials of the service account that we need in our Node.js script to access our spreadsheet from Google Sheets.

![enter image description here](https://i.imgur.com/QjNBxD7.png)

Once you've followed all of these steps, you should see the newly created service account on the credentials page.
Take a note of the email address of the service account. We will need to share our spreadsheet with this account. Now copy the ```credentials.json``` file you renamed and then paste that file in the root of the project. (Root is the directory you see first in the project where contain files and folder.)

**Most IMPORTANT Part: Sharing the Spreadsheets with the ```Google Service Account```.**

Now that we have a service account, we need to share our spreadsheet with it. It's just like sharing a spreadsheet with any normal user account. Open all 3 spreadsheets in your browser and click on the **Share** button on top right corner. That will open a modal where you need to enter the email address of the service account. Uncheck the checkbox for **Notify people** since this will send an email and since service account does not have any mailbox, it will give you a mail delivery failure notification.

![enter image description here](https://i.imgur.com/FjRJUgM.png)

*This process must be done to all other 2 sheets also*. Click Share. And all the configurations are done. 
Now find the **credentials.json** file you renamed recently and put that file in the project folder. (Put in root directory). 

Now create another spreadsheet called ```Bits Registrations``` and then copy the ID of that spreadsheet also. Fill that ID in the ```REGISTER_ID``` field in ```.env``` file. 

**THIS STEP IS OPTIONAL AND CAN BE IGNORED**
Now we have to name some fields in the spreadsheets. Open **Coding Tasks, Design Tasks & Explore Tasks** spreadsheets and then fill the spreadsheets as below. (Repeat the same for other 2 sheets). 
![enter image description here](https://i.imgur.com/MFUlecq.png)

Now go to the **Bits Registration** spreadsheet and also fill it as below. 
![enter image description here](https://i.imgur.com/SZc14zL.png)
Share the **Google Service Account Email** with this spreadsheet too.

- ```SMTP_SERVER```,```SMTP_PORT```,```USERNAME``` & ```PASSWORD``` fields are used to send emails in the source code. You can use your existing SMTP credentials or create your own by referring below steps. (**Please note that Google Gmail stopped providing access to less secure apps recently.**). We are going to use [Sendinblue](https://sendinblue.com) as our email provider. 

 First go to **[Sendinblue](https://sendinblue.com)** and then Register for a new account. After registering go to the dashboard and then click on the Profile -> SMTP & API -> SMTP. Please refer below if you cannot understand.
 ![enter image description here](https://i.imgur.com/EOrNCky.png)
In the SMTP dashboard copy the values of **SMTP Server, Port, Login** and the **Master Password** under Your SMTP keys section. The values in the SMTP dashboard goes to the fields specified below.

|.env file values|Sendinblue values |
|--|--|
| ```SMTP_SERVER``` | **SMTP Server** |
| ```SMTP_PORT``` | **Port** |
| ```USERNAME``` | **Login** |
| ```PASSWORD``` | **Master Password** |

- ```MONGO_URI``` is used to specify the mongodb database URI that we'll using to store data. In order to fill this you first have to create an account in mongodb.

Create an account in **[MongoDB](https://account.mongodb.com/account/register)**.  Complete the About Me survey mongodb give. After that create a **FREE** Database in mongodb. Refer below image for more details.
![enter image description here](https://i.imgur.com/yOz6JDf.png)

After that click **Create Cluster** and you'll have a MongoDB instance running. In the dashboard click on **Database Access** and then click on **Add new Database User**. Type a username and any password you want. (Generating a password from mongodb is recommended.) Please refer below image for more details. 
![enter image description here](https://i.imgur.com/LFM3HN2.png)

and then don't forgot to adda built in role like below pictures. **Built-in-Role** -> **Select Role** -> **Atlas Admin** like this u can do it!

![enter image description here](https://imgur.com/y3g7Epr.png)

Save that Password somewhere else because you need it in the future steps. After that scroll down and then click on **Create User**. The user details you just created is used to access our mongodb database. After that go to **Network Access** below the Database Access. In the **Network Access** click on **Add IP Address** and then click **Allow Access From Anywhere**. Click on **Confirm** after that. Please refer below image for more details if you cannot understand. 

 ![enter image description here](https://i.imgur.com/rzuNlEW.png)
We added Allow Access from anywhere because you must be able to access your database from anywhere in the world. Every computer has it's own IP Address. So if you want your program to access the database only from your machine you can select **Add Current IP Address** instead. (This step is only for advanced users only). But for now we added it as Allow From Anywhere because most hosting providers change their IP addresses often. 

After that go to **Database** in the above and then click on **Connect**. And then click **Connect Your Application**. You'll be provided with a URI that you can copy. Please refer below if you cannot understand. 

![enter image description here](https://i.imgur.com/Hl7Sb5N.png)

![enter image description here](https://i.imgur.com/bNr3qDh.png)

![enter image description here](https://i.imgur.com/hrVB14I.png)

After you copy the URI paste it somewhere you like and then replace the **<password>** with the password you copied earlier. So your final URI should look something like this.

> mongodb+srv://someonecool:password@cluster0.flaplbb.mongodb.net/?retryWrites=true&w=majority

After that go ahead and paste this URI in the ```MONGO_URI``` field in ```.env``` file. 

- ```SITE_URL``` is the URL of the code instance you're running. So if you're running in localhost the URL would be ```http://localhost:3000```. If you're running using a hosting provider you may use the URL the provider give. Put the url in the **SITE_URL** field.

Now the ```.env``` file is completed. If you have made it this far that means you have interest in programming and you have patience. 

 **Enabling the Competition(Acesss To Parts Of The Webapp)**
 Run The Commands Given Below
 ```js
npm run build
npm start
```
Then Go To The Website And Register An Account And Login To It, Once You Login The Competition Will Automaticly Get Enabled

**Getting Admin Access**

Download And Login To Your Mongodb Database in MongoDB Compass Or Using The MongoDB Extention For VS Code([here](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode)). You can use [MongoDB Web](https://mongodb.com) if you wish.

After You Logged To Your Database, Go To The Folder Under The "Local" Folder
![enter image description here](https://i.imgur.com/QtbOmDk.png)
	
Go To The Users Tab
	
![](https://i.imgur.com/AmGleAq.png)
	
When You Go To The Users Tab You Will See Your User Data It Should Look Like This:
![](https://i.imgur.com/KSbl5PX.png)
	
When You Hover Over The User Data Some Buttons Will Pop-Up As Seen On The Image Above. Click The Button That Has The Pencil Icon And Click On The Text ```False``` That Is Infront Of The Text ```adminUser```
![](https://i.imgur.com/leoU8N0.png)
	
Replace ```false``` with ```true``` And Click The Update Button As Seen Below
![](https://i.imgur.com/oOvxBzS.png)
	
 Now The Your Account Has Admin Power, Now You Can Access ```/admin``` Page and ```admin/power``` Page
 
If the code is running without an error, Congrats 🥳🥳. Everything is working as expected. You should celebrate a bit. Now find bugs, improvements and make this code awesome.

**READ CONTRIBUTING.md FILE BEFORE DOING A PULL REQUEST.**

**Contributing Guidelines**
What kind of pull requests are we looking?
 1. Code Improvements
 2. Quality Improvements
 3. Code Bugs
 4. New Concepts
 5. Documentation Error Updates

Lead Developers who made all of this possible.

 1. [Pasindu Ranasinghe](https://github.com/PasinduDushan)
 2. [Minuka Gunawansa](https://github.com/minukag)
 
Cool Contributors.

 1. [RamiruThehan](https://github.com/RamiruThehan)
 2. [GAVIFDO](https://github.com/GAVIFDO)
 3. [SenuraPerera08](https://github.com/senura-47802)
 4. [VidulHB](https://github.com/VidulHB)

We will put your name in the contributor side in the website and also in this repository readme. If you have any questions regarding the source code please call or send a WhatsApp message to the desired contact. 

- Pasindu Ranasinghe - 077 697 6673 (Question Regarding Backend Side and .env File)
- Minuka Gunawansa - 077 707 5625 (Questions Regarding Frontend Side)
