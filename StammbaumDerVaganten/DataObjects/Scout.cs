using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class Timespan
    {
        public Date Start = new Date();
        public Date End = new Date();
        public bool WholeTime = false;
    }

    public class Membership : DataObject
    {
        public Timespan Timespan = new Timespan();
        public Group Group = new Group();
    }

    public class Activity : DataObject
    {
        public Timespan Timespan = new Timespan();
        public Role Role = new Role();
        public Group Group = new Group();
    }

    public class Scout : DataObject
    {
        public String Forename = new String();
        public String Lastname = new String();
        public String Scoutname = new String();

        public Date Birthdate = new Date();

        public String ContactInfo = new String();
        public String Comment = new String();

        public List<Membership> Memberships = new List<Membership>();
        public List<Activity> Activities = new List<Activity>();

        #region Retrieve Memberships and Activities
        public Membership GetFirstMembershipByGroup(Group group)
        {
            List<Membership> result = new List<Membership>();
            foreach (Membership ms in Memberships)
            {
                if (ms.Group == group)
                {
                    return ms;
                }
            }
            return null;
        }

        public Activity GetFirstActivityByGroup(Group group)
        {
            foreach (Activity a in Activities)
            {
                if (a.Group == group)
                {
                    return a;
                }
            }
            return null;
        }

        public List<Membership> GetMembershipsInGroup(Group group)
        {
            List<Membership> result = new List<Membership>();
            foreach (Membership ms in Memberships)
            {
                if (ms.Group == group)
                {
                    result.Add(ms);
                }
            }
            return result;
        }

        public List<Activity> GetActivitiesInGroup(Group group)
        {
            List<Activity> result = new List<Activity>();
            foreach (Activity a in Activities)
            {
                if (a.Group == group)
                {
                    result.Add(a);
                }
            }
            return result;
        }
        #endregion

    }
}
