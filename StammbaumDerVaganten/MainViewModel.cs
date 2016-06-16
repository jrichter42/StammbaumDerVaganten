using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class MainViewModel
    {
        public Database Database;

        public List<Scout> Scouts
        {
            get { return Database.Data.Scouts; }
            set { Database.Data.Scouts = value; }
        }

        public List<Group> Groups
        {
            get { return Database.Data.Groups; }
            set { Database.Data.Groups= value; }
        }

        public List<Role> Roles
        {
            get { return Database.Data.Roles; }
            set { Database.Data.Roles = value; }
        }
        
        public MainViewModel()
        {
            Database = new Database();
            if (!Database.Load())
            {
                int a = 0;
            }

            if (!Database.Save())
            {
                int a = 0;
            }
        }
    }
}
