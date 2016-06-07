using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public struct Data
    {
        public List<Scout> Scouts;
        public List<Group> Groups;
        public List<Role> Roles;
    }

    public class Database
    {
        public Data Data;
        string test = "abc";
        public Database()
        {
            Data.Scouts = new List<Scout>();
            Data.Groups = new List<Group>();
            Data.Roles = new List<Role>();


            Group group = new Group();
            group.Type = GroupType_Type.Sippe;
            group.Name = "Phönix";
            Data.Groups.Add(group);

            Role role = new Role();
            role.Type = RoleType_Type.Sippenfuehrung;
            role.GroupType = GroupType_Type.Sippe;
            Data.Roles.Add(role);

            Scout scout = new Scout();
            scout.Forename = "Bob";
            scout.Lastname = "Baumeister";
            scout.Scoutname = "der";
            scout.Comment = "Jo, der schafft das!";
            scout.ContactInfo = "bob@baumeister.de";
            scout.Birthdate.Set(1985, 10, 14);
            
            Membership ms = new Membership();
            ms.Timespan.Start.Value.AddYears(2006);
            ms.Timespan.Start.YearDefined = true;
            ms.Group = group;

            scout.Memberships.Add(ms);

            Activity a = new Activity();
            a.Timespan.Start.Value.AddYears(2006);
            a.Timespan.Start.YearDefined = true;
            a.Group = group;
            a.Role = role;

            scout.Activities.Add(a);
            //for (int i = 0; i < 100; i++)
            Data.Scouts.Add(scout);
        }
    }
}
